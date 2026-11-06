# mlx-community/ACE-Step-1.5-vae-fp32

## Resumen

ACE-Step-1.5-vae-fp32 es la conversion a MLX en precision fp32 del VAE (autoencoder variacional) del modelo ACE-Step 1.5, un sistema de generacion de musica texto-a-audio desarrollado por ACE Studio y StepFun. Este repositorio no contiene el modelo generativo completo, sino exclusivamente el decodificador de audio Oobleck que transforma latentes de 64 dimensiones a 25 Hz en audio estereo a 48 kHz y viceversa, junto con su codificador. El paquete lo mantiene la organizacion mlx-community y esta pensado para ejecutarse sobre Apple Silicon mediante MLX.

El componente resuelve la conversion entre el espacio de audio y el espacio latente comprimido que utiliza el DiT (Diffusion Transformer) de ACE-Step 1.5. Al incluir tanto el encoder como el decoder, permite no solo sintetizar audio final a partir de latentes, sino tambien extraer latentes de audio de referencia para tareas de timbre de referencia, cover, repaint y extend de un fragmento de audio existente. Es relevante porque es una de las cuatro piezas (DiT turbo, planner, text encoder y VAE) que necesita el paquete Swift xocialize/mlx-ace-step-swift para funcionar de extremo a extremo en hardware de Apple.

La arquitectura deriva del VAE de Stable Audio Open, reajustada a 48 kHz estereo, con ratios de downsampling [2, 4, 4, 6, 10] que dan un hop de 1920 muestras. El checkpoint original se distribuye en bf16, pero esta version mantiene fp32 en todos los niveles de cuantizacion del paquete, lo que se traduce en una fidelidad de decodificacion de 118-121 dB frente al VAE de referencia en MLX. El modelo tiene 168.660.608 parametros y ocupa 0,7 GB en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AutoencoderOobleck (VAE con convoluciones y Snake activations), ratios de downsampling [2, 4, 4, 6, 10], hop 1920 |
| Parametros totales | 168.660.608 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio; latentes a 25 Hz, 64 dimensiones) |
| Tipos de cuantizacion | fp32 (este bundle); el checkpoint upstream se distribuye en bf16 |
| Idiomas soportados | no disponible (modelo de audio, sin texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX, layout de convoluciones [out, k, in]) |

## Arquitectura y entrenamiento

El VAE es un `AutoencoderOobleck` de la libreria diffusers, la misma familia arquitectonica que emplea Stable Audio Open, retargetizada a audio estereo de 48 kHz. La pila de downsampling usa ratios [2, 4, 4, 6, 10], lo que produce un factor de compresion total de 1920 muestras por paso latente; a 48 kHz esto equivale a una tasa de latentes de 25 Hz con 64 dimensiones por paso. La arquitectura emplea convoluciones con activaciones Snake, y el bundle incluye tanto el encoder como el decoder. La normalizacion de pesos se ha plegado en fp32 con numpy siguiendo el procedimiento del `vae_convert.py` original, y las convoluciones se han reordenado al layout `[out, k, in]` que espera MLX; los parametros de Snake se representan como vectores `[C]`. El resultado son 291 tensores que, segun el autor, son bit-iguales a la conversion oficial de upstream.

No se dispone de informacion sobre el dataset de entrenamiento del VAE (numero de horas de audio, composicion, procedencia) en la documentacion proporcionada. El modelo base ACE-Step 1.5 se describe en el tech report arXiv:2602.00744, pero esta ficha no incluye detalles de ese entrenamiento. La innovacion tecnica relevante de este bundle es la fidelidad numerica: la decodificacion alcanza 118-121 dB de relacion senal-ruido frente al VAE de referencia en MLX a fp32, y el conversor esta validado bit-a-bit contra los scripts oficiales `dit_convert.py` y `vae_convert.py`. El paquete mantiene el VAE en fp32 en todos los tiers de cuantizacion, de modo que la cuantizacion afecta al planner y al DiT, pero no al decodificador de audio.

## Capacidades

- Conversion audio a latentes: el encoder incluido extrae latentes de 64 dimensiones a 25 Hz a partir de audio estereo de 48 kHz, lo que habilita el timbre de referencia y las tareas de cover, repaint y extend.
- Conversion latentes a audio: el decoder reconstruye audio estereo a 48 kHz desde latentes, con calidad medida de 118-121 dB frente a la referencia fp32.
- Soporte de timbre de referencia: al codificar un clip de audio se pueden condicionar generaciones posteriores del DiT con ese timbre.
- Soporte de cover, repaint y extend: el encoder permite proyectar un fragmento fuente al espacio latente para que el DiT lo modifique o lo prolongue.
- Integracion en el pipeline completo: se carga como uno de los cuatro bundles (DiT turbo, planner, text encoder y VAE) del paquete xocialize/mlx-ace-step-swift.
- Ejecucion en Apple Silicon mediante MLX Swift, con API de motor (`MLXServeEngine`) y capacidad `music`.
- No realiza generacion de texto, razonamiento, codigo ni vision: es exclusivamente un componente de audio.
- No soporta tool calling ni razonamiento multi-paso por si mismo; esas funciones corresponden al planner del sistema completo.

## Casos de uso

- Sintesis de canciones completas en Apple Silicon: dentro del paquete Swift, el VAE decodifica los latentes producidos por el DiT turbo y el planner para generar una cancion estereo a 48 kHz a partir de caption y letras; es el ultimo paso del pipeline y determina la calidad final del audio.
- Timbre de referencia en produccion musical: se codifica un clip del artista o de una referencia sonora con el encoder y se usa su latente como condicionante, lo que permite generar material nuevo con un timbre coherente sin reentrenar el modelo.
- Cover de una cancion existente: se extraen los latentes del audio original con el encoder, el DiT los transforma segun un nuevo prompt y el decoder reconstruye la version cover manteniendo la estructura temporal.
- Repaint de secciones concretas: se codifica un fragmento, se enmascara la region a regenerar y se vuelve a decodificar, util para corregir un estribillo o sustituir un instrumento sin rehacer la pista completa.
- Extension de pistas (extend): se codifica el final de un clip y se generan latentes adicionales para prolongar la duracion, con continuidad de timbre garantizada por el encoder.
- Investigacion y evaluacion de VAEs de audio: al ser una conversion bit-igual y en fp32, sirve como referencia reproducible para comparar fidelidad de decodificacion entre implementaciones MLX y PyTorch.
- Prototipado de herramientas musicales en macOS/iOS: el paquete Swift permite integrar generacion musical en aplicaciones nativas de Apple sin depender de CUDA ni de servidores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un VAE de audio. El unico dato cuantitativo de rendimiento es la fidelidad de decodificacion reportada por el autor: 118-121 dB de relacion senal-ruido frente al VAE de referencia en MLX a fp32. No se proporcionan cifras de latencia ni de throughput.

| Metrica | Valor |
|---|---|
| Fidelidad de decodificacion (vs. VAE MLX fp32) | 118-121 dB |
| Tensores en el bundle | 291 |
| Equivalencia con conversion upstream | bit-igual |
| Latencia / throughput | no disponible |

## Requisitos de hardware

- VRAM/unified memory estimada: el bundle pesa 0,7 GB en fp32; en ejecucion el VAE requiere aproximadamente esa cifra mas los buffers de activacion, que dependen de la duracion del audio generado.
- GPU recomendadas: Apple Silicon con MLX (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No esta pensado para GPU NVIDIA ni AMD en esta distribucion.
- Cabe en GPU consumer: si, en cualquier Mac con Apple Silicon; el cuello de botella real es el DiT y el planner del pipeline completo, no este VAE.
- Opciones de despliegue: MLX Swift a traves de xocialize/mlx-ace-step-swift y MLXEngine; no se distribuye en GGUF ni en formatos para llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Frecuencia / latentes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACE-Step-1.5-vae-fp32 (este) | 168,6 M | VAE Oobleck, encoder + decoder | 48 kHz estereo, 64 d a 25 Hz | MIT | MLX, safetensors |
| VAE de Stable Audio Open | no disponible | AutoencoderOobleck | 44,1 kHz mono/estereo | Stability AI Community License | PyTorch, diffusers |
| VAE de ACE-Step 1.5 upstream (bf16) | 168,6 M | AutoencoderOobleck | 48 kHz estereo, 64 d a 25 Hz | MIT | PyTorch, safetensors |

La comparacion con Stable Audio Open es relevante porque la arquitectura Oobleck de ACE-Step deriva de ella y fue reajustada a 48 kHz; la diferencia clave es la licencia, MIT en ACE-Step frente a la licencia comunitaria de Stability, y el formato de pesos, MLX frente a PyTorch. Frente al checkpoint upstream de ACE-Step 1.5, este bundle se diferencia unicamente en el layout MLX, la precision fp32 fija y la inclusion del encoder. No se dispone de datos de benchmarks comparativos entre estos VAEs en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el DiT turbo, el planner y el text encoder del paquete Swift no genera audio por si mismo.
- Solo funciona en el ecosistema MLX/Apple Silicon; no hay pesos GGUF, ONNX ni PyTorch en este repositorio.
- El VAE se mantiene en fp32 en todos los tiers, por lo que no se puede reducir su huella de memoria mediante cuantizacion sin salir del paquete soportado.
- La procedencia de los pesos del VAE Oobleck no esta documentada upstream: el autor senala que no se especifica si se inicializaron desde el VAE comunitario de Stability, aunque ACE-Step declara MIT y distribuye los pesos bajo esa licencia.
- El repositorio upstream `ACE-Step/Ace-Step1.5` no incluye fichero LICENSE; el texto controlante es el LICENSE MIT del repositorio GitHub de ACE-Step (Copyright (c) 2026 ACEStep).
- Riesgo de artefactos y alucinaciones auditivas: como todo decoder generativo, puede introducir ruido, discontinuidades o instrumentos inexistentes, especialmente en pasajes largos.
- No se documentan sesgos demograficos ni culturales del VAE; el sesgo del sistema completo dependera del dataset de entrenamiento del DiT y del planner, no disponible aqui.
- Sin datos publicados de latencia, throughput ni consumo de memoria en produccion; las cifras deben medirse en el hardware objetivo antes de desplegar.
- El modelo no procesa texto ni idiomas; las capacidades multilingues corresponden al text encoder del pipeline, no a este bundle.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlx-community/ACE-Step-1.5-vae-fp32
- Modelo base: https://huggingface.co/ACE-Step/Ace-Step1.5
- Repositorio del modelo base en GitHub: https://github.com/ace-step/ACE-Step-1.5
- Licencia MIT del modelo base: https://github.com/ace-step/ACE-Step-1.5/blob/main/LICENSE
- Paquete Swift-MLX: https://github.com/xocialize/mlx-ace-step-swift
- Motor MLXEngine: https://github.com/xocialize/mlx-engine-swift
- MLX Swift: https://github.com/ml-explore/mlx-swift
- Tech report: https://arxiv.org/abs/2602.00744
- VAE upstream (Oobleck, Stable Audio format): https://huggingface.co/ACE-Step/ace-step-v1.5-1d-vae-stable-audio-format
