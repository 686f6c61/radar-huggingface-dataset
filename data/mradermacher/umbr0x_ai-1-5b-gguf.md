# mradermacher/umbr0X_ai-1.5B-GGUF

## Resumen

umbr0X_ai-1.5B-GGUF es la versión cuantizada en formato GGUF del modelo `gabrielbosse9/umbr0x_ai-1.5B`, un ajuste de 1.543.714.304 parámetros (~1,54 B) etiquetado como Qwen2. La conversión la publica mradermacher, cuantizador de la comunidad, no el autor original del modelo. El repositorio incluye cuantizaciones estáticas desde Q2_K hasta f16, pensadas para ejecutar el modelo en local con llama.cpp u otras herramientas compatibles con GGUF.

El modelo está declarado únicamente en inglés y se distribuye con licencia Apache-2.0. Los tags del repositorio incluyen `unsloth`, `trl` y `sft`, lo que apunta a un ajuste supervisado sobre una base Qwen2, pero la model card no documenta datos de entrenamiento, longitud de contexto, formato de prompt ni resultados de evaluación. Su interés práctico es acotado: permite probar un ajuste pequeño en hardware de consumo y sirve como artefacto de experimentación local; no hay evidencia pública que respalde un rendimiento competitivo.

La relevancia actual es la facilidad de despliegue: las cuantizaciones Q4_K_M y Q4_K_S ocupan alrededor de 1,0-1,1 GB y pueden ejecutarse en CPU o en GPUs con poca VRAM. Ahora bien, con 17 descargas y 0 me gusta, la adopción es muy baja y no sustituye a una evaluación propia antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only), según el tag `qwen2`; no confirmado en la model card |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (`en`); no se documentan otros |
| Licencia | Apache-2.0 (según metadatos del repositorio) |
| Formato de pesos | GGUF; el formato del modelo base no se detalla en la información disponible |
| Modelo base | `gabrielbosse9/umbr0x_ai-1.5B` |
| Cuantizador | mradermacher |
| Tamaño del repositorio | 14,2 GB (incluye todas las cuantizaciones) |
| Descargas | 17 |

## Arquitectura y entrenamiento

El repositorio es una conversión a GGUF de un modelo etiquetado como Qwen2, una arquitectura transformer decoder-only. No se documenta el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO ni los hiperparámetros del ajuste. Los tags `unsloth`, `trl` y `sft` sugieren que el modelo base se entrenó o ajustó con supervisión (SFT) usando esas herramientas, pero es una inferencia a partir de metadatos, no un dato confirmado por el autor.

La model card tampoco detalla innovaciones técnicas como atención lineal, decodificación especulativa o modo de razonamiento. La cuantización la realiza mradermacher con cuantizaciones estáticas; según la propia card, no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicación. El resultado es un artefacto de inferencia, no una nueva arquitectura ni un modelo entrenado desde cero.

## Capacidades

- Generación de texto autoregresiva en inglés; es la única capacidad declarada de forma explícita.
- Ajuste supervisado (SFT) según los tags; no se especifica el formato conversacional ni la calidad esperada.
- No hay documentación de tool calling ni function calling; no debe asumirse su disponibilidad.
- No hay soporte documentado de agentes, planificación multi-paso ni uso de herramientas.
- Idiomas: inglés (`en`); no se declaran capacidades multilingües.
- No se documentan visión, audio, modo thinking ni otras modalidades.
- Ejecución local mediante GGUF; compatible con el ecosistema llama.cpp.

## Casos de uso

- Prototipado de inferencia local: descargar Q4_K_M (~1,1 GB) y ejecutarlo con llama.cpp u Ollama para validar un pipeline de generación de texto en un portátil o en una GPU de 4-6 GB.
- Asistente conversacional interno en inglés: se puede mantener un historial de chat y generar respuestas para soporte de baja criticidad; al no documentarse la ventana de contexto, hay que limitar el historial y validar la coherencia.
- Generación de borradores y reescritura: útil para producir textos cortos, correos o resúmenes de documentos breves; la licencia Apache-2.0 facilita integrarlo en herramientas internas, con revisión humana.
- Etiquetado y clasificación por indicaciones: usar zero-shot o few-shot en inglés para categorizar tickets o comentarios; requiere medir precisión en el dominio antes de automatizar.
- Experimentación con fine-tuning: al ser un modelo pequeño y con licencia permisiva, sirve como base para SFT con TRL/Unsloth en tareas específicas; el repositorio de cuantización no sustituye al modelo base para entrenar.
- Generación de datos sintéticos de baja escala: crear ejemplos para pruebas de software o para aumentar un conjunto de validación; filtrar y revisar por riesgo de alucinación.
- Despliegue con privacidad en local: ejecución en una máquina sin enviar datos a la nube, adecuada para pruebas con datos no sensibles; no certificado para datos personales sin evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos van de 0,8 GB (Q2_K) a 3,2 GB (f16). Hay que sumar la memoria del runtime y la caché KV; al no documentarse la longitud de contexto, no se puede dar una cifra cerrada. Como referencia, Q4_K_M (~1,1 GB de pesos) puede funcionar con 2-4 GB de VRAM en contextos cortos.
- GPU recomendadas: cualquier GPU con 4 GB o más para Q4 con contexto corto; 8 GB o más para Q8_0 o f16 con margen. Una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB son suficientes; A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en GTX 1650 4 GB, RTX 3050 8 GB, RTX 3060 12 GB y similares usando Q4 o Q5. También puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y text-generation-webui. vLLM y TGI no están garantizados para este GGUF y requerirían conversión o verificación adicional.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para este modelo ni para las alternativas en la información consultada. La comparación se limita a tamaño y familia; no permite concluir que este ajuste sea mejor o peor.

| Modelo | Parámetros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---:|---|---|---|---|
| umbr0X_ai-1.5B-GGUF | 1,54 B | no disponible | Apache-2.0 | no disponible | HuggingFace, GGUF |
| Qwen2-1.5B-Instruct | ~1,5 B | no disponible | no disponible | no disponible | no verificada |
| TinyLlama-1.1B-Chat | ~1,1 B | no disponible | no disponible | no disponible | no verificada |
| SmolLM2-1.7B-Instruct | ~1,7 B | no disponible | no disponible | no disponible | no verificada |

## Limitaciones y advertencias

- Model card muy escasa: sin longitud de contexto, dataset, formato de prompt ni evaluación publicada.
- Riesgo de alucinación y errores factuales propio de un modelo de 1,5 B; no usar en decisiones médicas, legales o financieras sin verificación.
- Solo inglés declarado; no hay evidencia de calidad en castellano ni en otros idiomas.
- No se documentan tool calling, agentes, visión ni modo thinking.
- Sesgos conocidos: no documentados; tampoco se describe filtrado de seguridad ni alineamiento.
- Cuantizaciones Q2_K y Q3_K con pérdida de calidad; para uso práctico conviene Q4_K_M o superior.
- Licencia Apache-2.0 permisiva, pero conviene verificar la licencia del modelo base y la procedencia de los datos de entrenamiento; el repositorio no detalla el dataset.
- Adopción muy baja (17 descargas, 0 me gusta) y sin benchmarks; no hay señal pública de calidad.
- El contexto máximo no está documentado; limitar las ventanas y probar empíricamente antes de desplegar.
- El repositorio ocupa 14,2 GB porque incluye todas las cuantizaciones; descargar solo el archivo necesario.

## Enlaces

- [Repositorio GGUF en HuggingFace](https://huggingface.co/mradermacher/umbr0X_ai-1.5B-GGUF)
- [Modelo base gabrielbosse9/umbr0x_ai-1.5B](https://huggingface.co/gabrielbosse9/umbr0x_ai-1.5B)
- [Página de descargas de mradermacher para este modelo](https://hf.tst.eu/model#umbr0X_ai-1.5B-GGUF)
- [Solicitudes de cuantización de mradermacher](https://huggingface.co/mradermacher/model_requests)
- [Guía de uso de GGUF de TheBloke](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Comparativa de calidad de cuantizaciones de Artefact2](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
- [Gráfico de perplejidad de cuantizaciones](https://www.nethype.de/huggingface_embed/quantpplgraph.png)
