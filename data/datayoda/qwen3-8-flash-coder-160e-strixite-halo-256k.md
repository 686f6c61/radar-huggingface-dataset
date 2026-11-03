# datayoda/Qwen3.8-Flash-Coder-160E-strixite-Halo-256K

## Resumen

Qwen3.8-Flash-Coder-160E-strixite-Halo-256K es una conversión cuantizada del subconjunto de expertos de código (160 expertos enrutados) del modelo Qwen3.8-Flash-Next, publicada por el usuario datayoda. No es un fine-tune ni un modelo entrenado desde cero: es el resultado de aplicar un conjunto de herramientas de "slicing" sobre el checkpoint BF16 de 79,39 GiB de Jab1718/qwen3.8-flash-coder-85gb-bf16, eliminar determinadas capas (PLE de n-gramas, torre de visión y cabeza MTP) y reempaquetar los pesos en el formato `strixw` que consumen los kernels de strixite. El objetivo es claro: reducir el peso residente de 66 GiB más una tabla de n-gramas de 48 GiB a un único fichero de 23,33 GiB, de modo que en una máquina AMD Strix Halo con 128 GB de memoria unificada quepan muchas más ranuras de conversación de 256K.

La arquitectura subyacente es un transformer híbrido con 48 capas (36 de atención lineal y 12 QSA), un experto compartido por capa y 160 expertos enrutados con top-10 y renormalización. El contexto nativo es de 262.144 tokens con RoPE tal y como se entrenó (YaRN desactivado) y la caché K/V se almacena en q8. La cuantización es mixta: q4 con grupos de 128 para los expertos enrutados y la proyección de entrada GDN, q8 con grupos de 64 para expertos compartidos, proyecciones de atención, mezclas de hiperconexión y LM head, y BF16 para los embeddings.

Su relevancia es acotada pero muy específica: demuestra que es posible ejecutar un subconjunto funcional de un modelo MoE de código de gran tamaño en hardware de consumo profesional AMD (gfx1151) mediante ROCm/HIP, a costa de perder la decodificación especulativa DFlash, la entrada de imágenes y la contribución del PLE de n-gramas. El modelo no tiene descargas ni likes en el momento de redactar esta ficha y requiere una compilación modificada de strixite para cargarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE: 48 capas (36 de atención lineal, 12 QSA), 1 experto compartido por capa, 160 expertos enrutados por capa, top-10 con renormalización |
| Parametros totales | no disponible (el fichero pesa 23,33 GiB en cuantización mixta; el checkpoint BF16 de origen pesa 79,39 GiB) |
| Parametros activos | no disponible (top-10 de 160 expertos enrutados más el experto compartido por capa) |
| Longitud de contexto | 262.144 tokens (RoPE tal y como se entrenó, YaRN desactivado) |
| Tipos de cuantizacion | Mixta: q4 grupo 128 (expertos enrutados gate/up y down, GDN input), q8 grupo 64 (experto compartido, GDN output, atención qkv/o, mezclas HC, LM head, ple_kv), BF16 (embeddings) |
| Idiomas soportados | en |
| Licencia | qwen-community-1.0 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | `strixw` (formato propietario de strixite), 821 tensores, 25.046.114.304 bytes |

## Arquitectura y entrenamiento

El modelo es una conversión, no un entrenamiento. Los pesos proceden del subconjunto de 160 expertos del checkpoint BF16 de Qwen3.8-Flash-Next, extraído con la herramienta `moe-slice` (que elimina la capa PLE de n-gramas en la capa 2 junto con su tabla de búsqueda de 51.000 millones de parámetros, la torre de visión y la cabeza MTP). Sobre ese subconjunto, el conversor `convert_qwen4exp` (git `21324eb`) recuantiza los tensores al layout que leen los kernels de strixite, preservando los grupos de 128 elementos por experto en los expertos enrutados y bajando a 8 bits con grupos de 64 el resto de proyecciones. La conversión tardó 68 segundos en la máquina del autor y produjo 821 tensores.

La innovación técnica principal no está en el modelo sino en el pipeline de empaquetado: los headers de los shards se reescribieron para pasar de nombres planos `model.*` a `model.language_model.*` (que es lo que espera el conversor de strixite), copiando el blob de datos con `sendfile` en 58 segundos para 79,39 GiB sin reserializar tensor a tensor. El resultado es un fichero que ocupa el 29,4 % del checkpoint original. No hay información sobre el dataset de entrenamiento, el número de tokens vistos, ni sobre si el modelo base utilizó RLHF o DPO; la model card no los menciona.

## Capacidades

- Generación de texto y código: el modelo está etiquetado como `coding` y deriva de un subconjunto de expertos especializado en código de Qwen3.8-Flash-Next.
- Razonamiento multi-paso: la arquitectura MoE con top-10 sobre 160 expertos permite activar caminos especializados por token, aunque no se documenta un modo "thinking" explícito.
- Contexto largo: ventana de 262.144 tokens, adecuada para conversaciones o ficheros de código extensos.
- Idiomas: únicamente inglés según la model card (`language: en`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades especiales ausentes en esta build: sin decodificación especulativa DFlash (cabeza MTP eliminada), sin entrada de imágenes (torre de visión eliminada), sin contribución del PLE de n-gramas en el forward pass.

## Casos de uso

- Asistencia de código en local sobre hardware AMD Strix Halo: el modelo cabe en 23,33 GiB de pesos y permite mantener varias conversaciones de 256K simultáneas en una máquina de 128 GB de memoria unificada, algo imposible con el build original de 66 GiB más 48 GiB de tabla de n-gramas.
- Revisión de repositorios completos: con 262.144 tokens de contexto se puede cargar un conjunto amplio de ficheros fuente y pedir análisis cruzados, detección de inconsistencias o refactorizaciones que requieren ver múltiples módulos a la vez.
- Generación de tests y documentación técnica: el sesgo hacia código del subconjunto de expertos lo hace adecuado para producir suites de pruebas y docstrings a partir de firmas y cuerpos de funciones existentes.
- Migración de código entre lenguajes o frameworks: el contexto largo permite pasar un módulo completo junto con las convenciones del destino y obtener una traducción coherente sin perder referencias cruzadas.
- Explicación de código legacy: útil para equipos que necesitan documentar bases de código antiguas sin enviar el código a servicios en la nube, ya que el modelo se ejecuta íntegramente en local.
- Prototipado de pipelines de CI/CD con revisión automática: siempre que se acepte que esta build no soporta tool calling documentado, se puede integrar como paso de generación de parches o comentarios de revisión sobre diffs, con la salvedad de que la latencia será inferior al build con MTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente aporta un dato de rendimiento operativo: el build original de 512 expertos publica aproximadamente 47-50 tokens/s de decodificación sobre una conversación de 492.000 tokens con MTP activado. Esta build de 160 expertos corre con `mtp = off`, por lo que su tasa de decodificación es estrictamente inferior, pero el autor indica explícitamente que la magnitud de la caída no se ha medido.

## Requisitos de hardware

- VRAM / memoria: el fichero de pesos ocupa 23,33 GiB (25.046.114.304 bytes). Al ejecutarse sobre memoria unificada, el requisito práctico es disponer de una máquina con al menos 32 GB libres para una sola instancia, y 128 GB para aprovechar la ventaja de múltiples ranuras de 256K.
- GPU objetivo: AMD Strix Halo (gfx1151) con ROCm/HIP. El formato `strixw` está pensado para los kernels de strixite en esta plataforma.
- GPU consumer: no se documenta soporte para GPUs NVIDIA ni para GPUs AMD discretas de consumo; el tag `strix-halo` y `gfx1151` limitan el destino a ese SoC.
- Despliegue: strixite, con una compilación modificada que lea el número de expertos enrutados del fichero de pesos y que tolere la ausencia de la capa PLE. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no medidos para esta build. Como referencia, el build de 512 expertos con MTP alcanza ~47-50 tokens/s en decodificación sobre 492K tokens de contexto; esta build, sin MTP, será más lenta.
- Almacenamiento: 23,33 GiB para el fichero de pesos, más el espacio del tokenizer y los ficheros auxiliares del repo (25,1 GB totales).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Coder-160E-strixite-Halo-256K | no disponible (23,33 GiB en `strixw`) | 262.144 | Mixta q4/q8/BF16 | qwen-community-1.0 | HuggingFace (0 descargas) |
| Build original de 512 expertos (strixite) | no disponible (66 GiB de pesos + 48 GiB de tabla n-gramas) | 262.144 (hasta 492K en pruebas) | `strixw` | qwen-community-1.0 | Referenciado en la model card |
| Jab1718/qwen3.8-flash-coder-85gb-bf16 | no disponible (79,39 GiB BF16) | no disponible | BF16 | no disponible | HuggingFace (modelo base) |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | BF16 | qwen-community-1.0 | HuggingFace (modelo base) |

La comparación relevante no es frente a otros modelos de código de tamaño similar, sino frente a las otras variantes del mismo linaje: esta build sacrifica la tabla de n-gramas (48 GiB), la torre de visión y la cabeza MTP para reducir el peso residente de 66 GiB a 23,33 GiB, a cambio de perder decodificación especulativa y entrada multimodal. No se dispone de datos de benchmarks que permitan comparar calidad de código frente a alternativas.

## Limitaciones y advertencias

- Requiere una compilación modificada de strixite: en la versión estándar v0.5.0, `Qwen4ExpDims::experts` vale 512 por defecto y nunca se lee del fichero, por lo que la carga falla en la primera comprobación de forma de experto. También hay que proteger las llamadas a `ngram_rows()` con `has_ngram_rows()` y usar el `tokenizer.json` de referencia, porque el del slicer divide por `\p{L}` y strixite implementa la variante `[\p{L}\p{M}]`.
- Sin decodificación especulativa: la cabeza MTP se ha eliminado y el modelo corre con `mtp = off`, lo que reduce la tasa de decodificación respecto al build de 512 expertos. La magnitud de la pérdida no está medida.
- Sin visión: la torre de visión se ha eliminado; cualquier entrada de imagen será rechazada.
- Sin PLE de n-gramas: la capa PLE de la capa 2 y su tabla de 51.000 millones de parámetros no están presentes, por lo que la contribución de n-gramas al forward pass desaparece. No se documenta el impacto en calidad.
- Idioma: solo inglés según la model card; no hay evidencia de soporte multilingüe en esta build.
- Licencia: qwen-community-1.0, etiquetada como `other` en HuggingFace. Es responsabilidad del usuario revisar los términos antes de un uso comercial; la model card no aclara restricciones específicas.
- Riesgo de alucinación: no cuantificado; al ser una conversión de un subconjunto de expertos sin fine-tune posterior, hereda los sesgos y limitaciones del modelo base, que no se documentan.
- Madurez: 0 descargas y 0 likes en el momento de la ficha, publicada el 3 de noviembre de 2026. No hay evidencia de uso en producción ni de validación independiente.
- Plataforma: el formato `strixw` y los tags `gfx1151`, `rocm` y `hip` atan el modelo a AMD Strix Halo; no es portable a otros backends sin reconversión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/datayoda/Qwen3.8-Flash-Coder-160E-strixite-Halo-256K
- Modelo base (subconjunto BF16): https://huggingface.co/Jab1718/qwen3.8-flash-coder-85gb-bf16
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio de strixite: https://github.com/shawnshekari/strixite
