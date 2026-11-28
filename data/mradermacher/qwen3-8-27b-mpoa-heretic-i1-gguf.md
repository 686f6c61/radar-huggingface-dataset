# mradermacher/Qwen3.8-27B-MPOA-heretic-i1-GGUF

## Resumen

Qwen3.8-27B-MPOA-heretic-i1-GGUF es una cuantizacion GGUF del modelo richardyoung/Qwen3.8-27B-MPOA-heretic, un derivado "abliterated" (con los mecanismos de rechazo eliminados) de la familia Qwen3.8 de 27B parametros. El autor de la cuantizacion es mradermacher, especialista en publicar versiones GGUF con matrices de importancia (imatrix) para despliegue en llama.cpp y entornos de inferencia local. El modelo base fue publicado por Richard J. Young, Ph.D., bajo un regimen de acceso restringido (gated) orientado a investigacion en seguridad de IA y red-teaming.

El modelo resuelve el problema de disponer de una variante sin filtros de rechazo de un LLM de ~27B en formato GGUF cuantizado, lo que permite ejecutarlo en hardware de consumo o en servidores modestos. La cuantizacion incluye un amplio espectro de niveles (desde IQ1_S de 7,2 GB hasta Q6_K y superiores), lo que facilita ajustar el equilibrio entre calidad y huella de memoria. Segun la model card, el modelo base es multimodal (vision), aunque los ficheros mmproj se alojan en el repositorio estatico separado.

La relevancia actual radica en su uso como herramienta de investigacion en alineacion y seguridad: permite estudiar el comportamiento de un modelo sin refusal entrenado, y su formato GGUF lo hace accesible para experimentacion reproducible en local. La licencia declarada es Apache-2.0, aunque el modelo base impone un gating con campos de uso previsto que conviene revisar antes de un despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.8); detalles no disponibles |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, entre otras |
| Idiomas soportados | en |
| Licencia | apache-2.0 (modelo base con gating de acceso) |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su pertenencia a la familia Qwen3.8 y su naturaleza transformer. El modelo es un derivado "heretic/abliterated", es decir, se ha sometido a un proceso de eliminacion de la direccion de rechazo (refusal) en el espacio de activaciones, tecnica habitual en la comunidad para producir variantes sin censura. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO adicionales sobre el modelo original.

La model card indica que el modelo base es multimodal (vision), y que los ficheros mmproj correspondientes, si existen, se encuentran en el repositorio estatico de cuantizaciones (mradermacher/Qwen3.8-27B-MPOA-heretic-GGUF). Las cuantizaciones i1 se han generado con matrices de importancia (imatrix), lo que mejora la calidad respecto a cuantizaciones estaticas equivalentes en tamano. Se incluye tambien el fichero imatrix (0,1 GB) para que terceros puedan generar sus propias cuantizaciones.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento y respuesta a instrucciones sin mecanismos de rechazo entrenados (variante "uncensored/abliterated").
- Capacidad multimodal (vision) segun la model card, con ficheros mmproj en el repositorio estatico.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles segun el campo language.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en seguridad de IA y alineacion: el modelo permite estudiar como se comporta un LLM de ~27B sin refusal entrenado, comparandolo con la version original para analizar que direcciones de activacion codifican el rechazo.
- Red-teaming y evaluacion de robustez: util para generar respuestas que un modelo alineado rechazaria y asi probar clasificadores de seguridad, filtros de contenido y sistemas de moderacion.
- Experimentacion local con llama.cpp u Ollama: las cuantizaciones Q4_K_M (16,6 GB) o IQ4_XS (15,2 GB) permiten ejecutar el modelo en una GPU de consumo de 24 GB o en configuraciones CPU+GPU con RAM suficiente.
- Docencia y cursos sobre LLM: el amplio rango de cuantizaciones (desde 7,2 GB hasta mas de 20 GB) permite ilustrar el impacto del nivel de cuantizacion en calidad y velocidad con hardware asequible.
- Analisis de sesgos y comportamiento: al carecer de rechazo, sirve para estudiar que contenidos genera el modelo ante prompts sensibles y documentar sesgos latentes del modelo base.
- Generacion de datos sinteticos para entrenamiento: puede emplearse para producir corpus de texto en ingles en pipelines internos, siempre que se revise el cumplimiento de la licencia y las condiciones de acceso del modelo base.
- Pruebas de pipelines de inferencia GGUF: util para validar integraciones con llama.cpp, servidores compatibles con endpoints y herramientas de cuantizacion (generacion de nuevas cuantizaciones a partir del fichero imatrix incluido).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: i1-IQ1_S ~7,2 GB; i1-IQ2_M ~10,1 GB; i1-IQ3_M ~12,7 GB; i1-IQ4_XS ~15,2 GB; i1-Q4_K_M ~16,6 GB; i1-Q5_K_M y superiores por encima de 18-20 GB (tamanos exactos no disponibles para todos los niveles).
- GPU recomendadas: para Q4_K_M o IQ4_XS, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para cuantizaciones de mayor calidad (Q5/Q6) se recomienda A100 40 GB, H100 o RTX 6000 Ada.
- Cabe en GPU de consumo: si, en modelos con 24 GB de VRAM usando cuantizaciones IQ4_XS o Q4_K_M; en GPUs de 12-16 GB solo con cuantizaciones IQ2/IQ3 de menor calidad.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con endpoints (tag endpoints_compatible); vLLM y TGI no soportan GGUF de forma nativa en todos los casos, por lo que se recomienda llama.cpp para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-MPOA-heretic-i1-GGUF (este) | ~26,9B | no disponible | apache-2.0 (base con gating) | GGUF i1 | Variante abliterated, solo ingles, vision segun model card |
| richardyoung/Qwen3.8-27B-MPOA-heretic (base) | ~26,9B | no disponible | apache-2.0 (gated) | safetensors | Modelo original sin cuantizar, acceso restringido |
| mradermacher/Qwen3.8-27B-MPOA-heretic-GGUF (estatico) | ~26,9B | no disponible | apache-2.0 | GGUF estatico | Misma base, cuantizaciones sin imatrix; incluye mmproj |
| Alternativas abliterated de ~27B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo "abliterated/uncensored": se ha eliminado el comportamiento de rechazo, por lo que puede generar contenido danino, ilegal o inexacto sin advertencia; no es apto para uso directo con usuarios finales sin moderacion adicional.
- Riesgo elevado de alucinacion y de afirmaciones no verificadas, agravado por la ausencia de mecanismos de rechazo.
- Sesgos conocidos del modelo base Qwen3.8 no documentados en la informacion disponible; se recomienda evaluacion propia antes de cualquier uso.
- Soporte unicamente de ingles segun el campo language; el rendimiento en castellano no esta garantizado.
- El modelo base esta sujeto a gating con campos de afiliacion y uso previsto; aunque la licencia declarada es Apache-2.0, conviene revisar las condiciones de acceso del repositorio original antes de un uso comercial.
- Longitud de contexto no especificada; no se debe asumir un contexto largo sin verificacion empirica.
- El repositorio pesa 300,3 GB y contiene multiples cuantizaciones; es necesario descargar solo el fichero deseado para evitar consumo excesivo de disco y ancho de banda.
- No se han publicado benchmarks; el rendimiento real por cuantizacion debe medirse en el hardware objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-MPOA-heretic-i1-GGUF
- Modelo base: https://huggingface.co/richardyoung/Qwen3.8-27B-MPOA-heretic
- Cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/Qwen3.8-27B-MPOA-heretic-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-MPOA-heretic-i1-GGUF
- Perfil del autor del modelo base: https://huggingface.co/richardyoung
- CV del autor del modelo base: https://cv.deepneuro.ai
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
