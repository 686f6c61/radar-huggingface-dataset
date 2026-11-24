# Renesas/Gemma-4-E2B-it-GGUF

## Resumen

Gemma-4-E2B-it-GGUF es una distribución en formato GGUF del modelo Gemma 4 E2B-it de Google, publicada por Renesas para ejecutar generación de texto y chat sobre la plataforma Renesas R-Car X5H con acelerador NPU NPX6. El modelo base es un transformer decoder-only de la familia Gemma 4, en su variante "E2B" (elastic parameters, aproximadamente 2B de parámetros efectivos) e instruido (it). El repositorio incluye los pesos en FP16 en formato GGUF, el tokenizer, la plantilla de chat y un instalador autoextraíble con los grafos NPU, firmware y módulos de kernel necesarios para el despliegue en la placa.

La relevancia de esta ficha es que no se trata de un checkpoint genérico para GPU de centro de datos, sino de un artefacto de despliegue en hardware embebido automotriz. Renesas proporciona un runner específico para R-Car X5H (xOS-v4.34) y publica mediciones de throughput en esa plataforma: 11,3 tokens/s en FP16 y 27,2–29,5 tokens/s en W4A16 sobre una NPU de 12 núcleos a 1066 MHz, con prefill de 829 tokens en 0,577–0,708 s. Estas cifras son las únicas de rendimiento publicadas en la información disponible.

El modelo es solo texto en esta release; la entrada de imagen, audio y vídeo se anuncia como "coming soon", aunque la model card lista el audio como completado en la hoja de ruta y describe un codificador de audio opcional de unos 615 MB que el runner carga desde un safetensors separado. La licencia es Gemma, con las restricciones de uso que esta implica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma 4 decoder-only, variante E2B (elastic parameters) |
| Parámetros totales | 4.647.450.147 (según safetensors del modelo base) |
| Parámetros activos | no disponible (no se especifica si es MoE; E2B se describe como "elastic parameters", no como mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP16 (GGUF publicado); W4A16 (4-bit pesos, 16-bit activaciones, anunciado y medido en la placa); W8A8 para audio-encode; int4/int8 en los grafos NPU |
| Idiomas soportados | no disponible |
| Licencia | Gemma |
| Formato de pesos | GGUF (FP16, 9,3 GB, 601 tensores); safetensors para el codificador de audio (~615 MB, 752 tensores) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E2B-it de Google, un transformer decoder-only de la familia Gemma 4 con "elastic parameters" y unos 4.647 millones de parámetros totales según el safetensors del checkpoint. La model card del repositorio de Renesas no detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo RLHF, DPO u otras etapas de alineación posteriores al instruction tuning; esa información corresponde a la model card oficial de Google, que no se incluye en la información proporcionada.

La innovación técnica relevante en esta distribución no está en el modelo sino en el pipeline de despliegue: Renesas compila los grafos NPU con coeficientes int4/int8 precalculados (unos 2,5 GB), incluye el firmware de la NPU (14 ELFs por NPU), los módulos de kernel (`snps_accel`, `snps_arcsync`, `snps_rproc`) y scripts de arranque (`setup_npu.sh`, `npuN_power_on.sh`, `npuN_run.sh`). El runner lee los pesos de texto del GGUF y, opcionalmente, los pesos del codificador de audio desde un safetensors extraído del checkpoint de Hugging Face mediante peticiones HTTP por rangos, sin descargar el fichero completo de 10 GB. Nada se compila en la placa: el instalador es autoextraíble.

## Capacidades

- Generación de texto y chat conversacional en modo solo texto en esta release.
- Instrucción y alineación conversacional propias de la variante `-it` de Gemma 4.
- Entrada de audio: la hoja de ruta la marca como completada y el runner admite un WAV mono de 16 kHz de hasta 30 s mediante el codificador de audio opcional; la codificación de un clip de 30 s se mide en 81,6 ms en W8A8.
- Entrada de imagen y vídeo: anunciadas como "coming soon", no disponibles en esta release.
- Tool calling / function calling: no se documenta en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no se documenta en la información disponible.
- Capacidades multilingües: no disponible; la model card no lista idiomas.

## Casos de uso

- Asistente de voz embebido en el vehículo: el runner acepta audio de 16 kHz de hasta 30 s y lo codifica en 81,6 ms, de modo que un sistema de infoentretenimiento puede transcribir y responder en la propia placa sin enviar audio a la nube.
- Chat de texto en cabina para control por lenguaje natural: con 27,2–29,5 tokens/s en W4A16, el modelo puede generar respuestas de una o dos frases en aproximadamente un segundo, suficiente para confirmaciones y consultas de estado.
- Procesamiento de lenguaje natural en el vehículo con conectividad intermitente: al ejecutarse íntegramente sobre la NPX6, permite clasificación de intenciones, resumen de notificaciones o extracción de entidades sin depender de un enlace externo.
- Prototipado de funciones de IA generativa en la plataforma R-Car X5H: el instalador autoextraíble y el runner permiten validar el comportamiento del modelo en el hardware objetivo antes de integrarlo en un producto, sin recompilar nada en la placa.
- Evaluación de precisión y latencia en NPU para ingeniería de producto: las mediciones de prefill (829 tokens en 0,577–0,708 s) y de decode permiten dimensionar presupuestos de tiempo real para funciones de asistencia.
- Despliegue de un modelo de 4,6B parámetros en un SoC automotriz sin GPU dedicada: el uso de grafos int4/int8 precompilados y pesos FP16 en GGUF demuestra la viabilidad de servir un LLM de este tamaño en el presupuesto térmico y de memoria de un sistema embebido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (MMLU, HumanEval, GSM8K, etc.) en la información disponible; la model card indica explícitamente "TBD — not yet measured/published for this repo". Las únicas métricas publicadas son de throughput en la placa R-Car X5H (1 NPU, 12 núcleos, 1066 MHz, batch 1):

| Modelo / fase | Precisión | Dispositivo | Throughput | Tipo |
|---|---|---|---|---|
| Decode | FP16 | X5H, 1 NPU, 12 núcleos, 1066 MHz | 11,3 tokens/s | Medido |
| Decode | W4A16 | X5H, 1 NPU, 12 núcleos, 1066 MHz | 27,2 tokens/s (frío), 29,5 tokens/s (warmup) | Medido |
| Prefill | W4A16 | X5H, 1 NPU, 12 núcleos, 1066 MHz | 829 tokens de entrada en 0,708 s a 1170 tokens/s (frío); 0,577 s a 1436 tokens/s (warmup) | Medido |
| Audio-encode | W8A8 | X5H, 1 NPU, 12 núcleos, 1066 MHz | clip de 30 s en 81,6 ms | Medido |

## Requisitos de hardware

- Plataforma objetivo: placa Renesas R-Car X5H (b001, doble NPX48K) con NPU NPX6 y acceso root, sistema xOS-v4.34.
- Espacio en disco: aproximadamente 2 GB para el paquete de instalación y unos 2,5 GB adicionales una vez instalado; el GGUF FP16 ocupa 9,3 GB y el codificador de audio opcional unos 615 MB.
- VRAM: no aplica en el sentido convencional; el modelo se ejecuta sobre la memoria del SoC y la NPU, no sobre una GPU discreta. No se especifica el consumo de memoria en ejecución.
- GPU recomendadas: no disponible; el artefacto está empaquetado para NPU NPX6, no para CUDA.
- Compatibilidad con GPU de consumo: no disponible; el runner incluido es un binario para R-Car X5H y no se documenta su uso con llama.cpp, Ollama, vLLM o TGI.
- Opciones de despliegue: instalador autoextraíble `gemma4-e2b-runner-0.1.0-Linux.sh` (FP16) y `gemma4-e2b-runner-0.3.0-Linux.sh` (W4A16), con `setup_npu.sh` y el binario `gemma4-e2b-runner`.
- Latencia y throughput: ver tabla de benchmarks; en FP16, 11,3 tokens/s de decode; en W4A16, 27,2–29,5 tokens/s y prefill de 829 tokens en 0,577–0,708 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Renesas/Gemma-4-E2B-it-GGUF | 4.647.450.147 | no disponible | 11,3 tok/s FP16 y 27,2–29,5 tok/s W4A16 en R-Car X5H | Gemma | GGUF + runner para X5H |
| google/gemma-4-E2B-it | no disponible | no disponible | no disponible en la información proporcionada | Gemma | Checkpoint original en Hugging Face |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de precisión ni de otros modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo texto en esta release: la entrada de imagen y vídeo está anunciada como "coming soon"; el audio se lista como completado pero requiere descargar y extraer un codificador separado.
- No hay benchmarks de precisión publicados: la model card marca la exactitud como "TBD", por lo que no se puede evaluar la calidad del modelo frente a alternativas con datos objetivos.
- Dependencia total del hardware: el runner es un binario para R-Car X5H con xOS-v4.34 y NPU NPX6; no se documenta su uso en GPU, CPU genérica ni en otros SoCs.
- Idiomas soportados no disponibles: la model card no lista idiomas, lo que impide garantizar cobertura multilingüe.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad ni de tasas de alucinación; como todo LLM generativo, puede producir contenido incorrecto, especialmente en dominios especializados.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Licencia Gemma: el uso comercial y la redistribución están sujetos a los términos de la licencia Gemma de Google, que incluyen restricciones de uso aceptable; conviene revisarlos antes de integrar el modelo en un producto.
- Madurez del artefacto: el repositorio tiene 369 descargas y 0 likes, y la versión del runner es 0.1.0 (FP16) y 0.3.0 (W4A16), lo que sugiere un estado temprano para producción.
- Longitud de contexto no documentada: no se puede planificar el dimensionamiento de memoria para conversaciones largas a partir de la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Renesas/Gemma-4-E2B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Model card oficial de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Banner de Gemma 4: https://ai.google.dev/gemma/images/gemma4_banner.png
- Pesos GGUF FP16 (espejo citado en la model card): https://huggingface.co/SthRen0125/google_gemma-4-E2B-it/resolve/main/gemma-4-E2B-it_text_model_gguf/gemma-4-E2B-it-F16.gguf
- Renesas (sitio corporativo): https://www.renesas.com/en
- Renesas en Wikipedia: https://en.wikipedia.org/wiki/Renesas_Electronics
- Productos Renesas: https://www.renesas.com/en/products
- Sobre Renesas: https://www.renesas.com/en/about
