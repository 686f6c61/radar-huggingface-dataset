# amd/SSD-1B_m1.0_npu

## Resumen

SSD-1B_m1.0_npu es una distribucion del modelo de generacion de imagenes SSD-1B (Segmind Stable Diffusion 1B), publicada por AMD en formato ONNX y optimizada para ejecucion sobre las NPU de la plataforma Ryzen AI. El modelo original es un destilado de Stable Diffusion XL que reduce el UNet a aproximadamente 1.000 millones de parametros, lo que rebaja de forma notable los requisitos de computo frente a SDXL manteniendo una calidad de generacion razonable para su tamano.

Esta variante concreta no anade capacidades nuevas al modelo base: su interes esta en el empaquetado. AMD distribuye los pesos en ONNX cuantizados para aprovechar la unidad de procesamiento neuronal (NPU) integrada en los procesadores Ryzen AI, lo que permite generar imagenes en portatiles y equipos de sobremesa sin depender de una GPU dedicada. El repositorio esta marcado como de acceso restringido (gated), por lo que es necesario aceptar las condiciones en Hugging Face antes de descargarlo.

La relevancia actual del modelo es practica: encaja en el nicho de inferencia de difusion en hardware de bajo consumo y en el ecosistema de herramientas de AMD para IA local. No obstante, conviene tener presente que es un modelo de imagen (text-to-image), no un modelo de lenguaje, y que su unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion (destilado de Stable Diffusion XL), pipeline text-to-image de diffusers |
| Parametros totales | no disponible (el nombre del modelo indica ~1.000 millones en el UNet) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; sin ventana de contexto de tokens declarada) |
| Tipos de cuantizacion | pesos ONNX cuantizados para NPU Ryzen AI (esquema exacto no disponible) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (repositorio de 21,8 GB) |

## Arquitectura y entrenamiento

El modelo base SSD-1B es un modelo de difusion latente con arquitectura UNet, obtenido mediante destilacion a partir de Stable Diffusion XL. La destilacion reduce el numero de parametros del UNet hasta el orden de los 1.000 millones, lo que disminuye los requisitos de memoria y el coste por paso de denoising en comparacion con SDXL, a cambio de una perdida de calidad y diversidad en las imagenes generadas. El pipeline es text-to-image: un codificador de texto procesa el prompt y el UNet genera el latente que despues decodifica el VAE.

La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens o pares imagen-texto utilizados, ni si hubo etapas de ajuste fino con preferencias humanas. La innovacion tecnica de esta publicacion de AMD no esta en el entrenamiento sino en la conversion a ONNX y la cuantizacion para la NPU de Ryzen AI, orientada a reducir el consumo energetico y habilitar inferencia local en CPU/NPU. Tampoco se documentan en la informacion proporcionada tecnicas como decodificacion especulativa, atencion lineal u otras optimizaciones de inferencia mas alla de la propia cuantizacion.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) en ingles.
- Ejecucion sobre NPU de Ryzen AI mediante pesos ONNX cuantizados.
- Compatibilidad con el ecosistema diffusers/ONNX para integracion en pipelines de Python.
- Modelo destilado de SDXL: menor coste computacional por imagen que el modelo del que deriva.
- No soporta tool calling ni function calling.
- No es un modelo de agentes ni de razonamiento multi-paso; no dispone de modo thinking.
- No procesa vision de entrada ni audio: solo genera imagenes a partir de texto.
- Capacidad multilingue limitada al ingles segun los metadatos del repositorio.

## Casos de uso

- Generacion de imagenes en portatiles Ryzen AI sin GPU dedicada: el empaquetado ONNX para NPU permite ejecutar el pipeline en equipos con graficos integrados, reduciendo el consumo energetico frente a una ejecucion en CPU pura.
- Prototipado rapido de conceptos visuales: al ser un modelo destilado de ~1B de parametros, los tiempos por imagen son contenidos y resulta adecuado para iterar sobre prompts en fases de diseno.
- Generacion de ilustraciones y assets para aplicaciones: integrable via diffusers/ONNX en scripts que produzcan imagenes de catalogo, banners o placeholders con licencia Apache 2.0.
- Pruebas de concepto de IA generativa en entornos Windows con Ryzen AI: util para validar flujos de despliegue en NPU antes de invertir en infraestructura GPU.
- Educacion y demostraciones: su tamano moderado y su licencia permisiva lo hacen idoneo para talleres sobre difusion latente y cuantizacion en hardware de consumo.
- Generacion de variaciones y material de apoyo en pipelines creativos donde la calidad de SDXL no es imprescindible y prima la eficiencia energetica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: NPU integrada en procesadores AMD Ryzen AI; el repositorio esta empaquetado especificamente para esta plataforma.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada; al tratarse de un modelo de ~1B en el UNet con pesos ONNX cuantizados, el requisito de memoria es sensiblemente inferior al de SDXL.
- GPU recomendadas: no disponible; el foco del empaquetado es la NPU, no la GPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el formato ONNX podria ejecutarse en otros backends, pero no esta documentado en la ficha.
- Opciones de despliegue: runtime ONNX sobre Ryzen AI; integracion con diffusers/ONNX Runtime. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| SSD-1B_m1.0_npu (este modelo) | ~1B en UNet (segun denominacion) | no disponible | apache-2.0 | Hugging Face, acceso restringido, formato ONNX para NPU |
| SSD-1B (Segmind) | ~1B en UNet | no disponible en esta ficha | apache-2.0 | Hugging Face, pesos diffusers |
| Stable Diffusion XL | no disponible en esta ficha | no disponible en esta ficha | licencia propia de Stability AI | Hugging Face |
| Stable Diffusion 1.5 | no disponible en esta ficha | no disponible en esta ficha | CreativeML OpenRAIL-M | Hugging Face |

No se dispone de datos de rendimiento comparado en la informacion proporcionada; la comparativa se limita a tamano, licencia y formato de distribucion.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y exige aceptar condiciones en Hugging Face antes de la descarga.
- Solo ingles: los prompts en otros idiomas, incluido el castellano, pueden degradar la calidad de la imagen generada.
- Modelo destilado: la reduccion de parametros respecto a SDXL implica menor fidelidad al prompt, peor composicion en escenas complejas y menor diversidad de resultados.
- Riesgo de sesgos: al derivar de datos web a gran escala, puede reproducir estereotipos de genero, etnia o profesion, y presentar dificultades con conceptos poco representados.
- Riesgo de contenido inapropiado o no fiel: la generacion puede producir imagenes inexactas respecto al prompt o contenido sensible; se recomienda filtrado y revision en produccion.
- Dependencia de hardware: el empaquetado esta orientado a NPU Ryzen AI; su uso en otras plataformas no esta documentado y puede requerir conversion adicional.
- Ausencia de benchmarks: no hay datos publicados de calidad (FID, CLIP score) ni de latencia en la informacion disponible, lo que impide evaluar su rendimiento real frente a alternativas.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene verificar las condiciones adicionales del acceso gated y las obligaciones de atribucion del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/SSD-1B_m1.0_npu
- Paper de referencia citado en los tags (arXiv:2401.02677): https://arxiv.org/abs/2401.02677
- Modelo base SSD-1B de Segmind: no disponible en la informacion proporcionada
- Documentacion de Ryzen AI: no disponible en la informacion proporcionada
- Repositorio diffusers: no disponible en la informacion proporcionada
