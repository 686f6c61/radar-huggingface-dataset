# SOLRICKS/MiniMax-H3-Upscaler

## Resumen

MiniMax H3 Upscaler es un conjunto de pesos y flujos de trabajo para ComfyUI que permite reescalar y refinar vídeos generados por el modelo de difusión MiniMax-H3. Lo publica el usuario SOLRICKS bajo el identificador SOLRICKS/MiniMax-H3-Upscaler y consta de dos piezas complementarias: un upscaler latente 3D basado en convoluciones (en FP16) y un refiner en formato LoRA cuantizado a INT8 que se aplica sobre el modelo base MiniMax-H3. No es un modelo de lenguaje ni un modelo fundacional independiente, sino un adaptador y un módulo auxiliar que dependen de los pesos de MiniMaxAI/MiniMax-H3 y de su VAE de vídeo.

El problema que resuelve es concreto: los vídeos que produce H3 a resoluciones como 1376×768 pierden detalle fino al ampliarlos con interpolación clásica. Este paquete aplica un upscaler aprendido en el espacio latente y después un refiner LoRA que reconstruye textura y nitidez, con un ejemplo documentado que pasa de 1376×768 a 1952×1088 conservando el audio y los FPS de origen. El nodo se integra en ComfyUI mediante un nodo propio ("MiniMax H3 Upscaler") y devuelve imágenes y audio.

Su relevancia actual es práctica: cubre el hueco de postprocesado de vídeo generativo dentro del ecosistema ComfyUI, con un repositorio ligero (2,7 GB) y flujos de trabajo listos para cargar. Es un proyecto experimental, con licencias mixtas (Apache-2.0 para el upscaler latente y MiniMax H3 Community License para el refiner INT8) y sin datos publicados de benchmarks objetivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Upscaler latente 3D con convoluciones (3d_conv) + refiner en formato LoRA sobre el modelo de difusión MiniMax-H3 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vídeo, no de texto) |
| Tipos de cuantizacion | FP16 (upscaler latente) e INT8 (refiner LoRA) |
| Idiomas soportados | no disponible (no procesa texto en el flujo de ejemplo; las entradas de condicionamiento de texto/audio quedan sin conectar) |
| Licencia | Mixta: upscaler latente Apache-2.0; refiner INT8 bajo MiniMax H3 Community License; código del nodo con licencia propia (file-specific-model-licenses) |
| Formato de pesos | safetensors (`minimax_h3_latent_upscaler_3d_conv_v1_fp16.safetensors`, `h3_upscale_refiner_int8.safetensors`) |

## Arquitectura y entrenamiento

El paquete se compone de dos módulos que actúan en secuencia sobre el pipeline de MiniMax-H3. El primero es un upscaler latente 3D con convoluciones, en FP16, que opera directamente sobre los latentes del VAE de vídeo de H3 y aumenta la resolución espacial manteniendo la coherencia temporal entre fotogramas. El segundo es un refiner en formato LoRA cuantizado a INT8 que se carga como adaptador del modelo de difusión H3 FL2VA y se encarga de recuperar detalle fino tras el reescalado. El nodo utiliza las implementaciones de modelo integradas en ComfyUI, de modo que no requiere código de inferencia propio más allá del nodo.

No se han publicado en la información disponible datos sobre el volumen de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones como decodificación especulativa. El flujo de ejemplo trabaja a 2,0 megapíxeles con chunking temporal y tiling espacial activados, y las dimensiones se ajustan a la rejilla de 32 píxeles de H3. El target debe ser al menos tan grande como la entrada. Se recomienda usar un modelo de difusión sin LoRAs de generación, Turbo o estilo, porque el nodo añade el refiner por su cuenta.

## Capacidades

- Reescalado de vídeo generado por MiniMax-H3 en el espacio latente, con upscaler 3D convolucional en FP16.
- Refinado de detalle tras el upscaling mediante LoRA INT8 sobre el modelo de difusión H3.
- Procesamiento de vídeo con audio: el flujo conserva los FPS de origen y pasa el audio de entrada sin modificarlo.
- Chunking temporal y tiling espacial para gestionar vídeos de mayor duración o resolución sin agotar memoria.
- Ajuste automático de dimensiones a la rejilla de 32 píxeles de H3.
- Integración nativa en ComfyUI mediante nodo propio y flujos de trabajo JSON (interfaz y cliente API).
- Exportación a MP4 a través de VideoHelperSuite.
- No incluye capacidades de texto, razonamiento, código, tool calling ni agentes: es una herramienta de postprocesado de vídeo.

## Casos de uso

- Postproducción de vídeo generativo: tomar clips I2V producidos por H3 a 1376×768 y llevarlos a 1952×1088 con detalle reconstruido, como demuestra el ejemplo del repositorio.
- Mejora de material de archivo generado: reescalar lotes de vídeos ya renderizados sin volver a muestrear desde cero, ahorrando cómputo de difusión completo.
- Pipelines de creación de contenido en ComfyUI: encadenar generación H3, upscaling y exportación MP4 con VideoHelperSuite dentro de un mismo grafo reproducible.
- Restauración de detalle en planos con movimiento: el upscaler 3D convolucional mantiene coherencia temporal, adecuado para secuencias con cámara en movimiento donde la interpolación clásica produce parpadeo.
- Integración vía API: el flujo `MiniMax_H3_Upscaler_API.json` permite automatizar el reescalado desde un cliente externo en servicios de render por lotes.
- Prototipado e investigación en vídeo generativo: permite comparar antes/después con los vídeos de ejemplo del repositorio y evaluar el efecto del refiner sobre el modelo base.
- Ajuste de resolución para distribución: adaptar clips a formatos que exigen mayor resolución manteniendo el audio original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio pesa 2,7 GB, pero la inferencia requiere además el modelo de difusión MiniMax-H3 FL2VA y el VAE de vídeo (descargas separadas, por ejemplo desde Kijai/MiniMax-H3-experimental), que dominan el consumo de memoria.
- El flujo de ejemplo arranca a 2,0 megapíxeles con chunking temporal y tiling espacial activados, lo que sugiere que sin esas técnicas el consumo de memoria sería elevado para vídeo de alta resolución.
- GPU recomendadas: no disponible. Por el tamaño del modelo base H3 y el procesamiento de vídeo, se espera que requiera GPUs de gama alta con VRAM amplia; no se confirma que quepa en GPUs de consumo.
- Despliegue: ComfyUI con el nodo "MiniMax H3 Upscaler", más VideoHelperSuite para exportación MP4. No se documentan opciones para vLLM, llama.cpp, Ollama o TGI (no aplicables a un pipeline de vídeo de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de upscaling latente de vídeo para H3 ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Proyecto marcado como experimental por el propio autor; no hay garantías de estabilidad en producción.
- Depende de descargas externas no incluidas: el modelo de difusión MiniMax-H3 FL2VA y el VAE de vídeo deben obtenerse por separado.
- El flujo de ejemplo no conecta las entradas de condicionamiento de texto ni de audio, por lo que no requiere text encoder ni audio VAE; usarlo con condicionamiento adicional queda fuera de lo documentado.
- No debe combinarse con LoRAs de generación, Turbo o estilo: el nodo añade el refiner y la mezcla puede degradar el resultado.
- El target debe ser al menos tan grande como la entrada y las dimensiones se ajustan a la rejilla de 32 píxeles, lo que limita resoluciones arbitrarias.
- Licencias mixtas: el refiner INT8 está bajo MiniMax H3 Community License, con posibles restricciones para uso comercial; el upscaler latente es Apache-2.0. Es imprescindible revisar LICENSES.md y NOTICE antes de un uso comercial.
- No se documentan sesgos, tasas de alucinación ni cobertura idiomática; al ser un modelo de vídeo sin componente de texto en el flujo de ejemplo, estas categorías no aplican directamente.
- Sin benchmarks publicados: el rendimiento cualitativo solo puede evaluarse con los vídeos de ejemplo del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SOLRICKS/MiniMax-H3-Upscaler
- Licencias: https://huggingface.co/SOLRICKS/MiniMax-H3-Upscaler/blob/main/LICENSES.md
- NOTICE: https://huggingface.co/SOLRICKS/MiniMax-H3-Upscaler/blob/main/NOTICE
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Pesos experimentales de referencia (Kijai): https://huggingface.co/Kijai/MiniMax-H3-experimental
- VideoHelperSuite: https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite
- Colección Visual AI Models & Tools: https://huggingface.co/collections/SOLRICKS/visual-ai-models-and-tools
- Vídeo original de ejemplo: https://huggingface.co/SOLRICKS/MiniMax-H3-Upscaler/resolve/main/Minimax_H3_I2V.mp4
- Vídeo reescalado de ejemplo: https://huggingface.co/SOLRICKS/MiniMax-H3-Upscaler/resolve/main/Minimax_H3_I2V_Upscaler.mp4
