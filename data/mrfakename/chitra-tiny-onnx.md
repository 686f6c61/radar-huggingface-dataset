# mrfakename/Chitra-Tiny-ONNX

## Resumen

Chitra-Tiny-ONNX es la exportacion a formato ONNX del modelo de generacion de imagenes udgamlabs/Chitra-Tiny, un modelo text-to-image de 212 millones de parametros que produce imagenes de 256×256 a partir de una frase en ingles. La exportacion la firma el desarrollador mrfakename y esta pensada especificamente para ejecutarse en el navegador mediante onnxruntime-web sobre WebGPU, sin necesidad de servidor ni de Python. El problema que resuelve es el de la inferencia de difusion directamente en el cliente, evitando costes de GPU en la nube y permitiendo que la generacion de imagenes ocurra en el dispositivo del usuario.

El modelo base Chitra-Tiny fue entrenado desde cero por Udgam Labs sobre aproximadamente 4,7 millones de imagenes de dominio publico y CC0, y esta disenado para correr en un portatil (en torno a 3 segundos por imagen en un Mac con Apple Silicon). Arquitectonicamente combina un encoder de texto google/flan-t5-base (a traves de la conversion de Xenova), un transformer de difusion (DiT) que opera sobre latentes de 32×32×4, y un decodificador VAE basado en stabilityai/sd-vae-ft-mse.

La relevancia actual de esta ficha radica en que es un ejemplo de pipeline de difusion completo empaquetado en tres grafos ONNX autocontenidos, con pesos en fp16 y calculo en fp32, y un peso total de repositorio de apenas 0,7 GB. Esto lo convierte en un candidato claro para demos web interactivas, prototipos y entornos con recursos limitados, aunque su resolucion de 256×256 y su tamano de 212M lo sitúan en la gama baja de calidad fotorrealista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) sobre latentes, con encoder de texto flan-t5-base y decodificador VAE sd-vae-ft-mse |
| Parametros totales | 212 millones (modelo base Chitra-Tiny) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 77 tokens de entrada para el text encoder (padding fijo a 77) |
| Tipos de cuantizacion | Pesos almacenados en fp16 y convertidos a fp32 dentro de cada grafo; el DiT no puede ejecutarse en fp16 por desbordamiento del residual stream |
| Idiomas soportados | Ingles (el modelo base se describe como text-to-image en ingles) |
| Licencia | Apache-2.0 (Chitra-Tiny y flan-t5-base); MIT (sd-vae-ft-mse) |
| Formato de pesos | ONNX (tres grafos: text_encoder.onnx, transformer.onnx, vae_decoder.onnx) |

## Arquitectura y entrenamiento

El pipeline se divide en tres grafos ONNX independientes. El primero es `onnx/text_encoder.onnx`, que es el encoder de google/flan-t5-base obtenido de la conversion de Xenova; recibe `input_ids` y `attention_mask` de tipo int64 con forma [B,77] y devuelve `last_hidden_state` de forma [B,77,768]. El segundo es `onnx/transformer.onnx`, que implementa el DiT de Chitra Tiny: toma el latente `x` [B,4,32,32], el paso de tiempo `t` [B], la condicion de texto `txt` [B,77,768] y su mascara `txt_mask` [B,77], y produce el campo de velocidad `v` [B,4,32,32]. El tercero es `onnx/vae_decoder.onnx`, el decodificador de stabilityai/sd-vae-ft-mse, que incluye el escalado 1/0,18215 y convierte el latente en una imagen [B,3,256,256] en el rango [-1,1].

El proceso de muestreo replica el del script `chitra_tiny.py`: se tokeniza con padding a 77, se codifican tanto el prompt como el negative prompt (vacio por defecto), se parte de ruido gaussiano y se aplican pasos Euler sobre `t = linspace(1, 0, steps+1)` con la actualizacion `x += (t[i+1] - t[i]) * (v_uncond + g * (v_cond - v_uncond))`, seguida de la decodificacion. Los valores por defecto son 50 pasos y un factor de guia (guidance) de 7. Sobre el entrenamiento, la informacion disponible indica que Chitra-Tiny se entreno desde cero con unos 4,7 millones de imagenes de dominio publico y CC0; no se detalla en la documentacion facilitada el numero de tokens de texto, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. El repositorio incluye `tools/export_onnx.py` para reproducir la conversion y `parity.json` con la comprobacion de paridad entre ONNX y PyTorch.

## Capacidades

- Generacion de imagenes text-to-image a partir de una frase en ingles, con resolucion fija de 256×256.
- Ejecucion local en el navegador gracias a onnxruntime-web sobre WebGPU, sin backend de Python.
- Control de la generacion mediante negative prompts, factor de guia (por defecto 7) y numero de pasos de muestreo (por defecto 50).
- Inferencia en CPU o GPU con pesos en fp16 y computo en fp32, lo que reduce a la mitad la descarga frente a un export en fp32 puro.
- Capacidad multimodal de salida (imagen) pero entrada unicamente textual; no acepta imagenes como condicionamiento.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es exclusivamente un modelo de difusion para imagenes.
- Soporte multilingue limitado al ingles, segun la descripcion del modelo base.

## Casos de uso

- Demos interactivas en navegador: el modelo se carga mediante onnxruntime-web y WebGPU, de modo que un usuario puede escribir un prompt y ver la imagen generada sin que el desarrollador mantenga una GPU en servidor; es el escenario del Space mrfakename/chitra-tiny-webgpu.
- Aplicaciones web con privacidad por diseno: al ejecutarse en el cliente, los prompts nunca salen del dispositivo del usuario, lo que encaja en herramientas creativas o educativas con requisitos de privacidad.
- Prototipado rapido de pipelines de difusion: con solo tres grafos ONNX y un repositorio de 0,7 GB, sirve para validar integraciones de text-to-image, ajustar schedulers y comparar parametros de muestreo antes de escalar a modelos mayores.
- Generacion de miniaturas y avatares de baja resolucion: la salida de 256×256 es suficiente para iconos, placeholders o previsualizaciones que luego se reescalan o se procesan con otro modelo.
- Herramientas creativas offline: al no requerir conexion ni servidor, puede integrarse en editores locales o aplicaciones de escritorio basadas en Electron que incluyan un runtime ONNX.
- Investigacion en eficiencia de modelos: su tamano de 212M y su capacidad de correr en un portatil lo convierten en una base para experimentos de cuantizacion, destilacion o comparacion de arquitecturas DiT frente a UNet.
- Educacion sobre difusion: los tres grafos separados (encoder de texto, DiT, VAE) permiten mostrar de forma tangible cada etapa del pipeline en un curso o taller.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica cifra de rendimiento aportada es la latencia aproximada de unos 3 segundos por imagen en un Mac con Apple Silicon, y la existencia de un archivo `parity.json` que documenta la verificacion de paridad numerica entre la salida ONNX y la de PyTorch.

## Requisitos de hardware

- VRAM estimada para inferencia: reducida, ya que el repositorio completo ocupa 0,7 GB con pesos en fp16; la carga en memoria durante la inferencia depende del runtime, pero un presupuesto de 1-2 GB de memoria suele ser suficiente.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGPU (Apple Silicon, GPUs Intel/AMD/NVIDIA recientes en navegadores compatibles) puede ejecutar el modelo; tambien funciona en CPU a traves de onnxruntime.
- Cabe en GPU de consumo: si, esta disenado para ello; el modelo base se describe como capaz de correr en un portatil, con unos 3 segundos por imagen en Apple Silicon.
- Opciones de despliegue: onnxruntime-web (navegador, WebGPU) es el objetivo principal; tambien onnxruntime en Python/C++ para escritorio o servidor. No se menciona soporte directo para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no a difusion.
- Latencia y throughput estimados: aproximadamente 3 segundos por imagen a 256×256 en Apple Silicon; no se dispone de cifras de throughput por lote ni de latencia en otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Contexto de texto | Licencia | Ejecucion en navegador |
|---|---|---|---|---|---|
| Chitra-Tiny-ONNX | 212M | 256×256 | 77 tokens | Apache-2.0 | Si (onnxruntime-web + WebGPU) |
| Stable Diffusion 1.5 | ~860M UNet | 512×512 | 77 tokens | CreativeML OpenRAIL-M | Posible con exportaciones ONNX, pero mas pesado |
| Stable Diffusion Turbo | ~860M UNet | 512×512 | 77 tokens | Stability AI Community | Posible, aunque mayor consumo de memoria |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros, resolucion y licencia. Chitra-Tiny-ONNX destaca por su tamano reducido y su orientacion explicita al navegador, mientras que las alternativas basadas en Stable Diffusion ofrecen mayor resolucion y calidad a costa de mas parametros y requisitos de hardware mas altos.

## Limitaciones y advertencias

- Resolucion fija de 256×256: es una salida de baja resolucion, adecuada para miniaturas o prototipos, pero insuficiente para uso grafico profesional.
- Solo ingles: el modelo base se describe como text-to-image en ingles, por lo que los prompts en otros idiomas pueden degradar la calidad del resultado.
- El DiT no puede ejecutarse en fp16: los pesos se almacenan en fp16, pero la computacion debe hacerse en fp32 porque el residual stream desborda el rango de fp16; esto limita las optimizaciones de velocidad por precision reducida.
- Riesgo de alucinacion visual: al ser un modelo generativo de difusion, puede producir imagenes incoherentes, con anatomia incorrecta o que no correspondan fielmente al prompt.
- Sesgos conocidos: no se documentan en la informacion disponible, pero el entrenamiento sobre conjuntos de imagenes de dominio publico y CC0 puede arrastrar sesgos de representacion y de estilo.
- Restricciones de licencia: Chitra-Tiny y flan-t5-base se distribuyen bajo Apache-2.0, y el VAE bajo MIT, lo que permite uso comercial; conviene revisar igualmente las condiciones del modelo base original y de las fuentes de datos.
- Dependencia de WebGPU: la ejecucion en navegador requiere un navegador y un dispositivo con soporte WebGPU estable; en entornos sin esta API el rendimiento puede caer al ejecutarse sobre CPU.
- Inexistencia de benchmarks publicos: no hay resultados de MMLU, HumanEval, GSM8K ni metricas de calidad de imagen (FID, CLIP score) en la informacion disponible, lo que dificulta evaluar su calidad objetiva frente a alternativas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicacion reciente y sin validacion comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrfakename/Chitra-Tiny-ONNX
- Modelo base: https://huggingface.co/udgamlabs/Chitra-Tiny
- Space de demostracion: https://huggingface.co/spaces/mrfakename/chitra-tiny-webgpu
- Repositorio GitHub del modelo base: https://github.com/UdgamLabs/chitra-tiny
- Encoder de texto (flan-t5-base): https://huggingface.co/google/flan-t5-base
- Conversion de flan-t5-base usada: https://huggingface.co/Xenova/flan-t5-base
- Decodificador VAE: https://huggingface.co/stabilityai/sd-vae-ft-mse
- ONNX Runtime (modelos): https://onnxruntime.ai/models
- Repositorio ONNX models: https://github.com/onnx/models
