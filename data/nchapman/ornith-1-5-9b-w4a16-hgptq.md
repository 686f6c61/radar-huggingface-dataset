# nchapman/Ornith-1.5-9B-W4A16-HGPTQ

## Resumen

Ornith-1.5-9B-W4A16-HGPTQ es una cuantización de 4 bits del modelo denso Ornith-1.5-9B de Ornith AI, un modelo de aproximadamente 9.000 millones de parametros construido sobre la arquitectura hibrida de Qwen y orientado a tareas multimodales de imagen-texto. La cuantización la firma nchapman y emplea el esquema GPTQ con rotacion de Hadamard en formato W4A16 (pesos de 4 bits, activaciones de 16 bits), empaquetado mediante compressed-tensors para su uso directo en vLLM y en el runtime propietario warp34.

El interes practico del modelo reside en que reduce el peso en disco de 17,98 GiB en BF16 a 6,67 GiB, lo que permite desplegar un modelo multimodal de casi 11.000 millones de parametros reales en GPUs de consumo de 12 GB o mas sin renunciar a la torre de vision ni al cabezal de prediccion multi-token (MTP) integrado. Segun la model card, conserva un 97,0 % de concordancia top-1 en vision aislada y un 94,7 % de concordancia en el borrador especulativo MTP respecto al modelo base de 16 bits.

Es relevante ahora porque combina tres piezas que rara vez aparecen juntas en un artefacto de 6,67 GiB: vision, decodificacion especulativa nativa mediante MTP y un formato de cuantizacion estandar compatible con vLLM 0.34 o superior. La licencia MIT del modelo base facilita su adopcion comercial, aunque la informacion disponible sobre el modelo original es escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido basado en Qwen (tag `qwen3_5`), con torre de vision y cabezal MTP; `custom_code` en transformers |
| Parametros totales | 10.703.777.520 (segun safetensors); el nombre comercial indica 9B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W4A16 GPTQ con rotacion de Hadamard; cabezal de salida en 8 bits; variante alternativa W2.6A16 (RCO) para GPUs de 8 GB |
| Idiomas soportados | No disponible |
| Licencia | MIT (heredada del modelo base ornith-ai/Ornith-1.5-9B) |
| Formato de pesos | safetensors con compressed-tensors (GPTQ empaquetado 4/8 bits) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen hibrida, segun la model card, con dos componentes adicionales que se conservan intactos tras la cuantizacion: una torre de vision para entrada imagen-texto y un cabezal de Multi-Token Prediction (MTP) que actua como borrador especulativo integrado. Ornith AI describe el modelo como resultado de un proceso de auto-mejora end-to-end, aunque no se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

La cuantizacion de nchapman aplica GPTQ con calibracion sobre el modelo completo: columna vertebral de texto, torre de vision y borrador MTP se calibran y cuantizan conjuntamente, con la cabeza de salida en 8 bits. La rotacion de Hadamard se usa para mejorar la fidelidad de los pesos de 4 bits y permitir servir en CUDA a plena velocidad sin flags adicionales en warp34. No se especifican el tamano del conjunto de calibracion ni el algoritmo exacto de rotacion en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en formato chat.
- Comprension de imagenes y respuesta texto a partir de entradas imagen-texto (pipeline `image-text-to-text`).
- Razonamiento multi-paso y decodificacion especulativa nativa mediante el cabezal MTP, que acelera la generacion al proponer varios tokens por paso.
- Capacidades multilingues: no documentadas en la informacion disponible.
- Soporte de tool calling y function calling: no documentado en la informacion disponible.
- Soporte de agentes: no documentado en la informacion disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente multimodal en local para desarrolladores: con 6,67 GiB en disco cabe en una RTX 3060 de 12 GB, lo que permite montar un chatbot que acepte capturas de pantalla o fotografias y responda en texto sin depender de la nube.
- Analisis de documentos con imagenes: el modelo puede recibir paginas escaneadas o diagramas junto con una pregunta textual, aprovechando la torre de vision cuantizada con un 97,0 % de concordancia top-1 respecto al base de 16 bits.
- Prototipado rapido de aplicaciones imagen-texto: al ser compatible con vLLM 0.34+ y con el pipeline de transformers, se puede integrar en un endpoint compatible con la API de OpenAI para pruebas de producto.
- Servicio de inferencia de bajo coste en produccion: el uso de MTP como decodificador especulativo integrado reduce el numero de pasos de decodificacion, lo que resulta adecuado para cargas interactivas con latencia sensible.
- Despliegue en estaciones de trabajo con una sola GPU consumer: warp34 permite servir el modelo con pesos empaquetados de 4 y 8 bits sin configuracion adicional, util para entornos de desarrollo sin cluster.
- Evaluacion comparativa de cuantizaciones: al existir una variante W2.6A16 para 8 GB, el par permite medir el impacto de la cuantizacion en calidad de vision y en aceptacion del borrador MTP dentro de un mismo pipeline.
- Fine-tuning ligero sobre la base cuantizada: no recomendado directamente sobre GPTQ, pero el modelo base BF16 con licencia MIT puede servir de punto de partida para adaptaciones con LoRA antes de cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta metricas de fidelidad de la cuantizacion frente al modelo base de 16 bits:

| Metrica | Resultado |
|---|---|
| Concordancia top-1 en vision aislada vs. BF16 | 97,0 % |
| Concordancia del borrador MTP vs. BF16 | 94,7 % |
| Reduccion de tamano en disco | 2,7x (17,98 GiB BF16 a 6,67 GiB) |

## Requisitos de hardware

- VRAM estimada: aproximadamente 6,67 GiB de pesos; con cache KV y contexto extendido se recomienda un minimo de 12 GB para margen operativo.
- GPU recomendadas: RTX 30/40-series con 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090); A100 y H100 tambien son compatibles via vLLM, aunque el modelo esta optimizado para el segmento consumer.
- Cabe en GPU consumer: si, en cualquier GPU con 12 GB o mas; para 8 GB existe la variante W2.6A16-HGPTQ-RCO de 5,55 GiB.
- Opciones de despliegue: warp34 (runtime recomendado por el autor), vLLM 0.34+ con `--trust-remote-code`, y transformers con `custom_code`. No se menciona soporte de llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles; la model card solo indica que el MTP integrado actua como decodificador especulativo y que la cuantizacion permite servir a plena velocidad en CUDA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | MTP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ornith-1.5-9B-W4A16-HGPTQ | 10,7B (9B nominal) | No disponible | Si | Si | MIT | Hugging Face, 217 descargas |
| Ornith-1.5-9B (BF16) | 10,7B | No disponible | Si | Si | MIT | Hugging Face |
| Ornith-1.5-9B-W2.6A16-HGPTQ-RCO | 10,7B | No disponible | Si | Si | MIT | Hugging Face, 5,55 GiB |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 4 bits introduce una perdida medible: un 3,0 % de discrepancia top-1 en vision y un 5,3 % en el borrador MTP respecto al modelo BF16. En tareas visuales de precision (OCR fino, lectura de tablas densas) conviene validar contra el modelo base.
- No hay datos publicados sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad del modelo base ni de la version cuantizada.
- El contexto maximo no esta documentado, lo que impide planificar cargas con ventanas largas sin pruebas previas.
- Los idiomas soportados no estan documentados; no se puede asumir un rendimiento multilingue equivalente al de la familia Qwen sin verificacion empirica.
- El soporte de tool calling y de agentes no esta confirmado en la informacion disponible; si se requiere para produccion, debe validarse explicitamente.
- Requiere `--trust-remote-code` en vLLM y transformers por el uso de `custom_code`, lo que implica ejecutar codigo del repositorio y anade superficie de riesgo en entornos no controlados.
- La licencia MIT del modelo base permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio original para confirmar que no existen terminos adicionales.
- El modelo tiene 217 descargas y 0 likes en el momento de la consulta, por lo que la validacion comunitaria es practicamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/nchapman/Ornith-1.5-9B-W4A16-HGPTQ
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B/blob/main/LICENSE
- Variante para 8 GB: https://huggingface.co/nchapman/Ornith-1.5-9B-W2.6A16-HGPTQ-RCO
- Runtime warp34: https://github.com/nchapman/warp34
- Laboratorio de cuantizacion: https://github.com/nchapman/warp34-quant-lab
- Informe tecnico de la cuantizacion: TECHNICAL.md (referenciado en la model card, sin URL directa disponible)
