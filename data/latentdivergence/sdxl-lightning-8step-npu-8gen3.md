# latentdivergence/sdxl-lightning-8step-npu-8gen3

## Resumen

SDXL-Lightning 8-step para NPU Hexagon es una compilación del UNet de ByteDance/SDXL-Lightning (destilado de SDXL base 1.0) orientada a la inferencia local de texto-a-imagen en el acelerador Hexagon HTP v75 del SoC Qualcomm Snapdragon 8 Gen 3. El autor, latentdivergence, ha convertido los pesos originales en un grafo ONNX con contexto EPContext para el execution provider QNN de ONNX Runtime, cuantizado a w8a16 (pesos int8, activaciones int16) y con entradas y salidas estáticas de 1024x1024. El resultado es un artefacto de 2,6 GB que ejecuta el paso de denoising del UNet íntegramente en la NPU del dispositivo, sin depender de GPU en la nube.

El modelo no introduce entrenamiento ni fine-tuning nuevo: es una obra derivada (cuantización y compilación) del UNet de 8 pasos de SDXL-Lightning, pensada para Latent Studio y para integración en aplicaciones móviles Android que necesiten generación de imágenes sin conectividad. La relevancia actual está en la viabilidad de ejecutar difusión de alta resolución en hardware móvil de gama alta, con un coste medido de 870,512 ms por ejecución del UNet en dispositivo real, lo que sitúa la generación completa de una imagen de 1024x1024 en el orden de pocos segundos contando VAE y text encoders.

La ficha cubre únicamente el UNet compilado; el decodificador VAE (SDXL fp16-fix en fp16 sobre NPU) y los text encoders int8 en CPU se distribuyen en repositorios separados del mismo autor, por lo que un despliegue completo requiere reunir tres artefactos distintos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusión latente (SDXL-Lightning 8-step, destilado de SDXL base 1.0), compilado como grafo ONNX QNN EPContext |
| Parametros totales | no disponible (el UNet SDXL ronda los 2,57 mil millones, pero el autor no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija encoder_hidden_states[1,77,2048] (77 tokens de texto CLIP) |
| Tipos de cuantizacion | w8a16 (pesos int8, activaciones int16); IO fp32; VAE externo en fp16 |
| Idiomas soportados | no disponible (los text encoders stock de SDXL son CLIP, predominantemente inglés) |
| Licencia | CreativeML Open RAIL++-M (openrail++), heredada de SDXL base 1.0 |
| Formato de pesos | ONNX (model.onnx + model.bin como EPContext QNN), safetensors de origen no incluidos |

## Arquitectura y entrenamiento

El componente es el UNet de SDXL-Lightning en su variante de 8 pasos, obtenido por destilación (no por RLHF ni DPO) desde stabilityai/stable-diffusion-xl-base-1.0. La arquitectura subyacente es el UNet transformer de SDXL con atención cruzada sobre embeddings de texto CLIP de 77 tokens y dimensión 2048, más text_embeds[1,1280] y time_ids[1,6] como condicionamiento adicional de tamaño y recorte. El sampler prescrito es Euler con espaciado de timesteps trailing, 8 pasos, guidance 1 (sin prompt negativo) y escalado de latentes por 0,13025; time_ids fijos en (1024, 1024, 0, 0, 1024, 1024).

La innovación técnica de esta ficha no está en el entrenamiento sino en el pipeline de compilación: el UNet se ha exportado con Qualcomm AI Hub (QAIRT 2.45) como grafo EPContext para el Hexagon HTP v75, con formas estáticas y cuantización w8a16 calibrada sobre 32 entradas reales de UNet extraídas de trayectorias fp32 de 8 pasos con 8 prompts (herramientas en tools/model-build/sdxl_lightning_npu). El objetivo es eliminar el coste de compilación en el dispositivo y maximizar la ocupación de la NPU. El autor no documenta el número de tokens de entrenamiento original ni la composición del dataset de destilación, que corresponden a la model card de ByteDance/SDXL-Lightning.

## Capacidades

- Generación de imágenes texto-a-imagen a 1024x1024 en 8 pasos de denoising, con guidance 1 y sin prompt negativo.
- Ejecución del paso UNet íntegramente en la NPU Hexagon HTP v75 del Snapdragon 8 Gen 3, con IO fp32 para interoperar con ONNX Runtime.
- Integración con el execution provider QNN de ONNX Runtime mediante grafo EPContext precompilado, sin compilación JIT en el dispositivo.
- Condicionamiento por embeddings CLIP (encoder_hidden_states), pooled text_embeds y time_ids, compatible con el pipeline SDXL estándar.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo.
- Capacidades multilingües limitadas por los text encoders CLIP stock de SDXL, no incluidos en este repositorio.

## Casos de uso

- Generación de imágenes offline en aplicaciones Android de gama alta: el grafo EPContext se carga directamente en el Snapdragon 8 Gen 3 y produce latentes de 1024x1024 en 8 pasos sin conexión, adecuado para apps de edición fotográfica o creatividad que no pueden depender de la nube.
- Prototipado de funciones de texto-a-imagen en Latent Studio: el artefacto está empaquetado para ese entorno y permite validar la latencia real (870,512 ms por ejecución del UNet) antes de comprometer recursos de producto.
- Evaluación de viabilidad de NPU para difusión: sirve como banco de pruebas para medir el reparto de coste entre UNet (NPU), VAE (NPU fp16) y text encoders (CPU int8) en un SoC concreto.
- Demos de investigación en dispositivos móviles: útil para experimentos de interacción creativa en ferias o laboratorios donde no hay GPU dedicada y se quiere mostrar generación local de 1024x1024.
- Integración en pipelines ONNX Runtime QNN existentes: al exponer un grafo EPContext con IO fp32, se puede encadenar con el VAE de latentdivergence/lcm-ssd1b-npu-8gen3 y los text encoders de latentdivergence/sdxl-lightning-4step-int8 para construir un pipeline completo.
- Benchmarking de cuantización w8a16 en difusión: la calibración documentada (32 entradas, 8 prompts, 8 pasos) permite reproducir y comparar la pérdida de calidad frente a fp32 en hardware real.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Latencia UNet en dispositivo (AI Hub) | 870,512 ms/run |
| Precision | w8a16 (int8 pesos, int16 activaciones) |
| Similitud coseno vs fp32 (peor paso held-out, dispositivo real) | no reportada (celda vacía en la model card) |
| Resolucion | 1024x1024 estatica |
| Pasos de sampling | 8 (Euler, trailing spacing, guidance 1) |

No se han publicado resultados de benchmarks de calidad (FID, CLIP score, MMLU, HumanEval u otros) en la informacion disponible. La única métrica cuantitativa es la latencia de 870,512 ms por ejecución del UNet en el Snapdragon 8 Gen 3.

## Requisitos de hardware

- SoC objetivo: Qualcomm Snapdragon 8 Gen 3 con NPU Hexagon HTP v75; el grafo EPContext está compilado específicamente para esa arquitectura y no es portable a otros chips sin recompilación.
- Memoria: el repositorio ocupa 2,6 GB (unet/model.bin de 2.644.193.280 bytes); se necesita espacio equivalente en almacenamiento del dispositivo y memoria suficiente para cargar el grafo y los latentes de 1024x1024.
- GPU dedicada: no aplica; el artefacto está diseñado para NPU móvil, no para A100, H100 ni RTX 4090.
- Consumer GPU: no procede; el grafo QNN no se ejecuta en GPUs de escritorio.
- Despliegue: ONNX Runtime con execution provider QNN (QAIRT 2.45), junto con el VAE de latentdivergence/lcm-ssd1b-npu-8gen3 y los text encoders int8 de latentdivergence/sdxl-lightning-4step-int8.
- Latencia: 870,512 ms por paso de UNet en dispositivo real; el tiempo total de generación depende del VAE y de los text encoders, no cuantificados en esta ficha.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/Resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| latentdivergence/sdxl-lightning-8step-npu-8gen3 | no disponible (UNet SDXL) | 1024x1024, 77 tokens de texto | 870,512 ms/run UNet en HTP v75 | openrail++ | Hugging Face, ONNX QNN |
| ByteDance/SDXL-Lightning (8-step) | no disponible | 1024x1024 | no disponible en esta ficha | openrail++ | Hugging Face, safetensors |
| stabilityai/stable-diffusion-xl-base-1.0 | no disponible | 1024x1024 | no disponible en esta ficha | openrail++ | Hugging Face, safetensors/diffusers |
| latentdivergence/sdxl-lightning-4step-int8 | no disponible | 1024x1024 | no disponible en esta ficha | openrail++ | Hugging Face, text encoders int8 CPU |

La comparación relevante es de despliegue: frente a los pesos originales en safetensors, esta variante sacrifica portabilidad (queda atada al HTP v75) a cambio de ejecución en NPU móvil con latencia medida. Frente a la variante de 4 pasos del mismo autor, esta usa 8 pasos y un UNet compilado para NPU en lugar de solo text encoders int8.

## Limitaciones y advertencias

- Dependencia de hardware: el grafo EPContext está compilado para Hexagon HTP v75 (Snapdragon 8 Gen 3); no funciona en otros SoC, GPUs de escritorio ni servidores sin recompilar con QAIRT.
- Artefacto incompleto por sí solo: requiere el VAE de latentdivergence/lcm-ssd1b-npu-8gen3 y los text encoders de latentdivergence/sdxl-lightning-4step-int8 para generar imágenes finales.
- Sin prompt negativo: guidance 1 implica que no se aprovecha negative prompting, lo que limita el control fino sobre el resultado.
- Calidad tras cuantización no verificada: la similitud coseno frente a fp32 en el peor paso held-out no está reportada, por lo que la pérdida de fidelidad no está cuantificada públicamente.
- Idiomas: los text encoders CLIP stock de SDXL están orientados al inglés; el soporte multilingüe no está documentado.
- Riesgo de sesgos y alucinación visual: hereda los sesgos del dataset de SDXL base 1.0 y puede producir contenido incoherente o estereotipado, especialmente en prompts ambiguos.
- Licencia: CreativeML Open RAIL++-M con restricciones de uso de Attachment A que se transmiten a cualquier redistribución; es responsabilidad del integrador verificar el cumplimiento en uso comercial.
- Sin garantías de mantenimiento: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día, sin historial de soporte.
- Memoria y almacenamiento: 2,6 GB de pesos más VAE y text encoders pueden ser restrictivos en dispositivos con almacenamiento ajustado.

## Enlaces

- Hugging Face: https://huggingface.co/latentdivergence/sdxl-lightning-8step-npu-8gen3
- Modelo base SDXL-Lightning: https://huggingface.co/ByteDance/SDXL-Lightning
- Modelo base SDXL 1.0: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- VAE para Snapdragon 8 Gen 3: https://huggingface.co/latentdivergence/lcm-ssd1b-npu-8gen3
- Text encoders int8: https://huggingface.co/latentdivergence/sdxl-lightning-4step-int8
- Qualcomm AI Hub: https://aihub.qualcomm.com/
- ONNX Runtime QNN execution provider: https://onnxruntime.ai/docs/execution-providers/QNN-ExecutionProvider.html
