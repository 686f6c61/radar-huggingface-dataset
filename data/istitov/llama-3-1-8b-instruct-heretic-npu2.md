# istitov/Llama-3.1-8B-Instruct-heretic-NPU2

## Resumen

`istitov/Llama-3.1-8B-Instruct-heretic-NPU2` es una conversión no oficial de un fine-tune comunitario de Meta Llama 3.1 8B Instruct, empaquetada en el formato Q4NX que consume FastFlowLM sobre las NPU AMD XDNA 2 (familia Ryzen AI 300 y posteriores). El modelo subyacente es el "Heretic" de p-e-w, una variante modificada para reducir la tasa de rechazos ("abliterated"), de la que ya no existe repositorio público; esta conversión parte del GGUF BF16 que publicó bartowski. El autor de esta ficha (istitov) no entrena nada: solo cuantiza y reempaqueta.

La relevancia es doble. Por un lado, demuestra que es posible ejecutar un modelo de 8B parámetros en la NPU integrada de un portátil con Ryzen AI 9 HX 370 a velocidades de decodificación cercanas a las de un runtime nativo (unos 11,3 tokens/s frente a 12,0 del modelo de referencia). Por otro, sirve como ejemplo de cadena de herramientas comunitaria (`flm-add`) para instalar modelos del Hub en FastFlowLM, que a fecha de la versión 1.0.12 no ofrece ese comando de forma nativa.

Se trata de un modelo de texto, sin visión ni audio, con contexto probado de 16.384 tokens, licencia Llama 3.1 y un tamaño de repositorio de 5,7 GB. No es un GGUF y no carga en Transformers, llama.cpp ni Ollama: está atado al runtime FastFlowLM (o a su fork OpenFlowLM) y a hardware AMD XDNA 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), pesos cuantizados en Q4NX para NPU XDNA 2 |
| Parametros totales | 8.030 millones (8B, heredado del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens probados (valor por defecto del registro) |
| Tipos de cuantizacion | Q4NX (formato propio de FastFlowLM); origen en GGUF BF16 |
| Idiomas soportados | no disponible (el modelo base Llama 3.1 soporta 8 idiomas oficiales: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | Q4NX (no GGUF, no safetensors); 292 tensores |
| Runtime | FastFlowLM 1.0.12 (probado); OpenFlowLM commit 96b915d |
| Hardware | NPU AMD XDNA 2 (Ryzen AI 300 series y posteriores) |
| Tamano del repositorio | 5,7 GB (descarga de 5,8 GB) |
| Sistema operativo probado | Linux (Windows no probado) |

## Arquitectura y entrenamiento

La arquitectura de red es la de Llama 3.1 8B Instruct: transformer decoder-only denso con 32 capas, atención con RoPE y tokenizador Llama 3.1 de 128.256 tokens, copiados sin cambios desde el modelo base (`config.json`, `tokenizer.json` y `tokenizer_config.json` son copias idénticas byte a byte). Lo diferencial no está en la red sino en el empaquetado: los pesos se cuantizan a Q4NX, el formato que FastFlowLM compila para los kernels de la NPU XDNA 2, con 292 tensores que coinciden en nombre, tipo, forma y tamaño con el fichero oficial de FastFlowLM.

No hubo entrenamiento en esta conversión. El linaje es: Meta Llama 3.1 8B Instruct (preentrenamiento y post-entrenamiento con SFT y RLHF por parte de Meta) → modificación "Heretic" de p-e-w para reducir rechazos → GGUF BF16 de bartowski → cuantización Q4NX de istitov. La técnica "abliteration" de p-e-w actúa sobre las direcciones de rechazo en el espacio de activaciones del modelo, típicamente mediante edición de pesos o fine-tuning selectivo; la model card no detalla el método exacto porque el repositorio original ya no es público. La cuantización puede alterar la tasa de rechazos en cualquier dirección respecto a la medición original.

## Capacidades

- Generación de texto conversacional en formato Instruct, con la plantilla de chat de Llama 3.1 sin modificar.
- Razonamiento general, matemáticas y generación de código heredados del modelo base de 8B.
- Multilingüismo según el modelo base (8 idiomas oficiales de Llama 3.1), aunque no hay evaluación específica publicada para esta conversión.
- Tasa de rechazos reducida: responde a peticiones que el modelo estándar declina, según las pruebas del publicador.
- No soporta visión, audio ni modalidades adicionales.
- Soporte de tool calling y function calling: no documentado en esta conversión; debe asumirse el del modelo base, sin verificación.
- Modo "thinking" o razonamiento extendido: no disponible.
- Ejecución exclusiva en NPU AMD XDNA 2 mediante FastFlowLM u OpenFlowLM.

## Casos de uso

- Asistentes conversacionales locales en portátiles con Ryzen AI: el modelo corre en la NPU integrada liberando CPU y GPU, con 16.384 tokens de contexto suficientes para conversaciones multi-turno de longitud media.
- Procesamiento de texto sin conexión en entornos con requisitos de privacidad: al ejecutarse íntegramente en local sobre la NPU, los datos no salen del dispositivo, lo que encaja en flujos de trabajo con información sensible.
- Prototipado de aplicaciones de IA en hardware de consumo: sirve para validar prompts, plantillas de chat y flujos de agente en un portátil antes de escalar a GPUs o a la nube.
- Generación de contenido sin filtros para investigación sobre seguridad y alineación: permite estudiar el comportamiento de un modelo con rechazos reducidos, comparándolo con el Instruct original, siempre en un entorno controlado.
- Evaluación de la cadena de herramientas FastFlowLM: útil para desarrolladores que quieran entender cómo se convierte un GGUF a Q4NX y cómo se registra un modelo comunitario con `flm-add` o `flm-custom-sync`.
- Tareas de redacción y resumen de documentos de longitud moderada: con 16.384 tokens de contexto puede procesar informes, correos o artículos completos en una sola pasada en local.
- Automatización de pruebas de regresión de prompts: al ser determinista en cuanto a plantilla y tokenizador, permite comparar respuestas frente al modelo de referencia en un mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos medidos son de rendimiento de inferencia:

| Metrica | Valor |
|---|---|
| Decodificacion (FastFlowLM 1.0.12) | ~11,3 tokens/s (modelo de referencia: 12,0 tokens/s) |
| Throughput en OpenFlowLM (peticion completa, prompt incluido) | ~6,5 tokens/s |
| Hardware de prueba | Ryzen AI 9 HX 370, 55 GiB de RAM visibles, Linux |
| Contexto de prueba | 16.384 tokens |
| Verificacion de pesos | 292 tensores coincidentes con el fichero oficial de FastFlowLM |

No hay cifras de tasa de rechazos publicadas para esta conversión; las del autor original no se conservan porque su repositorio dejó de ser público.

## Requisitos de hardware

- NPU AMD XDNA 2 obligatoria: Ryzen AI 300 series o posteriores. No funciona en GPUs NVIDIA, AMD Radeon ni en CPU.
- Memoria del sistema: la prueba se realizó con 55 GiB de RAM visibles en Linux; el modelo ocupa 5,7 GB en disco y debe caber en la memoria compartida accesible por la NPU.
- GPU dedicada: no aplica; el modelo no se ejecuta en GPU.
- Consumer: sí, en portátiles con Ryzen AI 9 HX 370 y similares; no cabe en GPUs de consumo convencionales porque el formato Q4NX no es compatible con ellas.
- Despliegue: FastFlowLM 1.0.12 (runtime oficial) u OpenFlowLM (fork comunitario con kernels abiertos). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Instalación: `pipx install flm-add` (o `uv tool install flm-add`) y `flm-add istitov/Llama-3.1-8B-Instruct-heretic-NPU2 --tag llama3.1-heretic:8b`; después exportar `FLM_CONFIG_PATH` y `FLM_XCLBIN_PATH` y ejecutar `flm run llama3.1-heretic:8b`.
- Latencia y throughput: ~11,3 tokens/s de decodificación en FastFlowLM; ~6,5 tokens/s contando prompt completo en OpenFlowLM.
- Advertencia de compatibilidad: una actualización de FastFlowLM que cambie el formato de pesos puede invalidar la conversión y requerir una nueva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-heretic-NPU2 (este) | 8B | 16.384 | Q4NX / FastFlowLM, NPU XDNA 2 | llama3.1 | Rechazos reducidos; solo NPU AMD |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128.000 | safetensors / Transformers, vLLM, etc. | llama3.1 | Modelo oficial, sin modificar; contexto completo |
| p-e-w/Llama-3.1-8B-Instruct-heretic | 8B | 128.000 (heredado) | safetensors / GGUF | llama3.1 | Fuente del fine-tune; repositorio ya no público |
| bartowski/p-e-w_Llama-3.1-8B-Instruct-heretic-GGUF | 8B | 128.000 (heredado) | GGUF / llama.cpp, Ollama | llama3.1 | Conversión intermedia usada como origen; ejecutable en CPU y GPU |

La diferencia clave frente a las alternativas es el soporte de hardware: este modelo solo corre en NPU AMD XDNA 2, mientras que el Instruct oficial y las conversiones GGUF se ejecutan en una gama mucho más amplia de dispositivos. A cambio, ofrece eficiencia energética y liberación de CPU/GPU en portátiles Ryzen AI.

## Limitaciones y advertencias

- Contenido sensible: el modelo puede generar material dañino, ofensivo o falso que otros modelos rechazan. Los rechazos están reducidos, no eliminados, y la cuantización puede haberlos alterado respecto a la medición original.
- Responsabilidad del despliegue: el usuario debe implementar su propia capa de moderación y seguridad; el publicador lo advierte explícitamente.
- Compatibilidad restringida: solo funciona en NPU AMD XDNA 2 con FastFlowLM u OpenFlowLM. No carga en Transformers, llama.cpp, Ollama, vLLM ni TGI.
- Fragilidad del formato: las actualizaciones de FastFlowLM que cambien el formato de pesos pueden romper la conversión.
- Solo Linux probado: Windows no se ha validado.
- Contexto limitado a 16.384 tokens en esta configuración, frente a los 128.000 del modelo base.
- Sin datos de benchmarks de calidad ni de sesgos específicos para esta conversión; el linaje "abliterated" puede aumentar la probabilidad de alucinación en temas sensibles.
- Licencia Llama 3.1: uso comercial permitido con condiciones (atribución "Built with Llama", límite de 700 millones de usuarios mensuales para licencia automática, restricciones de uso aceptable). Requiere revisar el texto completo de la licencia.
- Conversión no oficial: no está afiliada ni respaldada por Meta, p-e-w, bartowski, AMD ni el proyecto FastFlowLM.
- Idiomas: no hay evaluación específica; el soporte multilingüe se hereda del modelo base sin verificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/istitov/Llama-3.1-8B-Instruct-heretic-NPU2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- GGUF de origen (bartowski): https://huggingface.co/bartowski/p-e-w_Llama-3.1-8B-Instruct-heretic-GGUF
- FastFlowLM: https://github.com/ROCm/FastFlowLM
- OpenFlowLM (fork comunitario): https://github.com/Atomic-Germ/OpenFlowLM-Next
- Herramienta flm-add: https://pypi.org/project/flm-add/
- Colección de conversiones NPU2 Heretic: https://huggingface.co/collections/istitov/fastflowlm-npu2-heretic-conversions-6af22b7bf264c137a0b92875
- Overlay Gentoo del autor: https://github.com/istitov/stuff
- Guía de fine-tunes en NPU: https://istitov.github.io/stuff/guides/npu-custom-models/
