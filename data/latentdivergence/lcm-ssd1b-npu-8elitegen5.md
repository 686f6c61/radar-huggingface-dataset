# latentdivergence/lcm-ssd1b-npu-8elitegen5

## Resumen

lcm-ssd1b-npu-8elitegen5 es una compilacion del modelo de difusion LCM-SSD-1B (Latent Consistency Model sobre Segmind Stable Diffusion 1B) empaquetada como binario ONNX con el Execution Provider QNN de Qualcomm para la NPU Hexagon v81, presente en el SoC Snapdragon 8 Elite Gen 5. Lo publica el usuario latentdivergence y esta pensado para ejecutar generacion de imagenes texto-a-imagen en local, sobre el acelerador neuronal del dispositivo movil, sin depender de GPU ni de nube. El repositorio no contiene el pipeline completo: incluye unicamente el UNet y el decodificador VAE, mientras que los codificadores de texto y el tokenizer se comparten con sdxl-lightning-4step-int8.

El interes tecnico del artefacto esta en el rendimiento medido sobre Qualcomm AI Hub: 492,4 ms por paso de UNet y 1047,8 ms de decodificacion VAE, lo que lo convierte en el mas rapido de los cuatro objetivos (targets) compilados por el autor, aproximadamente un 33 % mas rapido que la variante v79. La arquitectura del binario esta fijada a v81, de modo que no carga en NPUs v79 ni v75.

Se trata de un modelo de nicho, orientado a despliegue en hardware concreto mas que a uso general: cero descargas y cero likes en el momento de redactar esta ficha, repo de 2,9 GB y una advertencia explicita del autor de que el binario aun no se ha verificado sobre hardware fisico, ya que no disponia de un dispositivo 8 Elite Gen 5. Las compilaciones v79 y v75 del mismo modelo si estan verificadas en dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion latente (familia Stable Diffusion XL) destilado con Latent Consistency Model; decodificador VAE |
| Parametros totales | aproximadamente 1.300 millones en el modelo base SSD-1B; el repositorio solo incluye UNet y VAE decoder |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como contexto de lenguaje; el tensor del codificador de texto es `encoder_hidden_states [1,77,2048]` (77 tokens de CLIP) |
| Tipos de cuantizacion | binario QNN/EPContext compilado para NPU Hexagon v81; precision interna no especificada en la informacion disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX EPContext wrapper (`model.onnx` + `model.bin`); subcarpetas `unet/` y `vae_decoder/` |

## Arquitectura y entrenamiento

El modelo es una destilacion LCM sobre SSD-1B, es decir, una version de Stable Diffusion XL reducida a unos 1.300 millones de parametros y adaptada para inferencia en pocos pasos (tipicamente cuatro). Sobre esa base, el repositorio publicado no distribuye pesos entrenables sin procesar, sino dos subgrafos ONNX compilados como envoltorios EPContext para la NPU Hexagon v81 de Qualcomm. El UNet expone seis entradas: `sample [1,4,128,128]`, `timestep [1]`, `encoder_hidden_states [1,77,2048]`, `time_ids [1,6]`, `text_embeds [1,1280]` y `timestep_cond [1,256]`, esta ultima correspondiente al embedding de guiado (guidance) de LCM; la salida es `output_0`. El decodificador VAE se construye a partir de madebyollin/sdxl-vae-fp16-fix.

La innovacion destacable es de ingenieria de despliegue mas que de modelado. El VAE original de SDXL desborda en fp16 (dos convoluciones alcanzan picos de 640.538 y 106.287 frente al techo de 65.504 de fp16) y produce imagenes completamente negras; los pesos corregidos alcanzan un pico de 2.301 y evitan el problema. Ademas, la compilacion esta especializada por version de NPU: un binario v81 no se carga en v79 ni en v75. No se documentan en la informacion disponible ni el volumen de tokens de entrenamiento, ni la composicion del dataset, ni si hubo RLHF o DPO (procedimientos que, por otra parte, no aplican a un modelo de difusion de este tipo).

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) mediante difusion latente en pocos pasos.
- Inferencia acelerada por NPU: el UNet y el VAE decoder se ejecutan como grafos QNN sobre Hexagon v81.
- Integracion con un pipeline externo: requiere codificadores de texto y tokenizer compartidos con sdxl-lightning-4step-int8.
- Ejecucion local en dispositivo movil, sin conexion a red ni GPU dedicada.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- Capacidades multilingues: no disponibles (el texto de entrada pasa por codificadores CLIP, habitualmente centrados en ingles).
- Capacidades especiales: no se documentan modo de razonamiento, vision de entrada, audio ni otras modalidades adicionales.

## Casos de uso

- Generacion de imagenes offline en aplicaciones moviles: el binario se ejecuta sobre la NPU del Snapdragon 8 Elite Gen 5, lo que permite crear imagenes sin enviar datos a un servidor y sin depender de conectividad.
- Edicion o generacion asistida en apps de fotografia: partiendo de un prompt de texto, el modelo produce una imagen latente que el VAE decoder reconstruye en pixeles, con un coste medido de 1047,8 ms de decodificacion.
- Prototipado de interfaces generativas en Android: un desarrollador puede integrar el pipeline en una demo nativa y medir latencia real por paso (492,4 ms de UNet) antes de decidir el numero de pasos LCM.
- Demostraciones en ferias y eventos: al ser un modelo de ~2,9 GB y ejecucion local, permite llevar una demo de generacion de imagenes sin infraestructura de servidor.
- Investigacion sobre compilacion de difusion en NPUs: sirve como referencia de un pipeline SDXL-family empaquetado como EPContext, util para comparar con las variantes v79 y v75 del mismo autor.
- Optimizacion de coste en servicios de imagen: sustituir llamadas a APIs de generacion por inferencia en dispositivo reduce el gasto por imagen en aplicaciones de gran volumen, siempre que el hardware objetivo este soportado.
- Pruebas de regresion de toolchain QNN: el artefacto es un caso concreto para validar que una build v81 no carga en NPUs de generaciones anteriores, util en pipelines de CI de equipos que mantienen varias versiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de generacion (FID, CLIP score, etc.) en la informacion disponible. Si se documentan metricas de latencia medidas sobre Qualcomm AI Hub:

| Metrica | Valor |
|---|---|
| Latencia por paso de UNet | 492,4 ms |
| Latencia de decodificacion VAE | 1047,8 ms |
| Comparativa frente a v79 | aproximadamente un 33 % mas rapido |
| Posicion entre los cuatro objetivos compilados | el mas rapido de los cuatro |

Estimacion derivada (no publicada como tal): con el flujo LCM habitual de cuatro pasos, el tiempo por imagen seria de aproximadamente 4 x 492,4 ms + 1047,8 ms = 3017,4 ms, es decir, en torno a 3,0 segundos por imagen, sin contar la codificacion de texto.

## Requisitos de hardware

- No es un modelo para GPU de escritorio: esta compilado especificamente para la NPU Hexagon v81 (Qualcomm QNN), por lo que las recomendaciones tipicas de VRAM para A100, H100 o RTX 4090 no aplican.
- Hardware objetivo: SoC Snapdragon 8 Elite Gen 5.
- Compatibilidad: un binario v81 no se carga en NPUs v79 ni v75; la arquitectura del binario esta fijada a la version de NPU.
- Cabe en dispositivo movil: el repositorio ocupa 2,9 GB entre UNet y VAE decoder.
- Opciones de despliegue: ONNX Runtime con el Execution Provider QNN, herramientas de Qualcomm AI Hub y el stack QNN de Qualcomm; el autor lo enmarca en Latent Studio.
- Latencia conocida: 492,4 ms por paso de UNet y 1047,8 ms de decodificacion VAE en Qualcomm AI Hub.
- Estado de validacion: el binario de este repositorio no esta verificado sobre hardware fisico; las compilaciones v79 y v75 del mismo modelo si lo estan.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Latencia documentada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lcm-ssd1b-npu-8elitegen5 | ~1.300 M (base SSD-1B) | no aplica (texto: 77 tokens) | 492,4 ms/paso UNet; 1047,8 ms VAE | apache-2.0 | HF, 0 descargas |
| lcm-ssd1b-npu (build v79) | ~1.300 M (base SSD-1B) | no aplica | aproximadamente un 33 % mas lento que v81 | apache-2.0 | verificado en dispositivo |
| lcm-ssd1b-npu (build v75) | ~1.300 M (base SSD-1B) | no aplica | no disponible | apache-2.0 | verificado en dispositivo |
| sdxl-lightning-4step-int8 | no disponible en la informacion | no aplica | no disponible | no disponible | aporta codificadores de texto y tokenizer a este pipeline |

Los modelos comparables son, en la practica, las otras compilaciones del mismo autor para distintas versiones de NPU, ya que no se ofrece en la informacion recibida ningun otro modelo de difusion compilado para Hexagon v81 con el que contrastar parametros y contexto. En cuanto al modelo base subyacente, SSD-1B se documenta publicamente como una variante de SDXL aproximadamente un 50 % mas pequena y un 60 % mas rapida, pero esa cifra corresponde al modelo original y no a esta compilacion.

## Limitaciones y advertencias

- No verificado en hardware fisico: el autor indica que no disponia de un dispositivo 8 Elite Gen 5, por lo que las latencias proceden de Qualcomm AI Hub y no de mediciones en dispositivo real.
- Portabilidad nula entre versiones de NPU: el binario v81 falla en v79 y v75.
- Dependencia de un toolchain propietario: requiere ONNX Runtime con el Execution Provider QNN y el stack de Qualcomm, lo que limita el despliegue a hardware compatible.
- Repositorio incompleto por diseno: no incluye codificadores de texto ni tokenizer, que deben tomarse de sdxl-lightning-4step-int8.
- Riesgo de imagenes defectuosas si se usa un VAE distinto: el VAE estandar de SDXL desborda en fp16 y produce salida completamente negra, de ahi el uso de sdxl-vae-fp16-fix.
- Sesgos: no documentados en la informacion disponible; al derivar de SDXL/SSD-1B hereda los sesgos de sus datos de entrenamiento, no detallados aqui.
- Riesgo de alucinacion visual: al ser un modelo generativo, puede producir contenido incoherente o no fiel al prompt; no se aportan metricas de fidelidad.
- Idiomas soportados: no disponibles; los prompts dependen de los codificadores CLIP compartidos, habitualmente orientados a ingles.
- Cuantizacion: la precision interna del binario QNN no se especifica, lo que dificulta estimar el impacto en calidad frente al modelo en fp16.
- Uso comercial: la licencia declarada es apache-2.0, pero conviene verificar las condiciones del modelo base (SSD-1B, LCM y el VAE de terceros) antes de un despliegue en produccion.
- Adopcion nula: cero descargas y cero likes, sin evidencia de uso en produccion ni de mantenimiento continuado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/latentdivergence/lcm-ssd1b-npu-8elitegen5
- Modelo base: https://huggingface.co/latent-consistency/lcm-ssd-1b
- Codificadores de texto y tokenizer compartidos: https://huggingface.co/latentdivergence/sdxl-lightning-4step-int8
- VAE decoder de origen: https://huggingface.co/madebyollin/sdxl-vae-fp16-fix
- Plataforma de perfilado citada: Qualcomm AI Hub (no se proporciona URL especifica en la informacion recibida)
