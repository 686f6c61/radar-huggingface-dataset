# Maximilian228/Geode-ACE-Step-1.5

## Resumen

Geode-ACE-Step-1.5 es una conversión del modelo de generación musical ACE-Step 1.5 (desarrollado por ACE Studio y StepFun) al formato propietario del motor Geode, una aplicación Android que ejecuta el modelo íntegramente en el dispositivo. El objetivo es permitir la generación de canciones completas —planificación, difusión y decodificación de audio— sin enviar datos a ningún servidor, algo relevante para privacidad, latencia y uso offline en telefonos.

La conversión mantiene los pesos originales del checkpoint SFT de ACE-Step 1.5, pero los reorganiza y cuantiza para que el motor Geode pueda cargarlos en CPU (SDOT), NPU Hexagon (HMX) o GPU móvil. El paquete compartido ocupa 4,99 GiB e incluye el planificador LM de 1,7B, los codificadores de texto, letra y timbre, y el decodificador de audio VAE; el paquete específico del modelo SFT añade 1,71 GiB con el DiT de difusión configurado para 50 pasos con CFG.

Es relevante porque demuestra que un pipeline de generación musical de varios componentes (encoder de texto Qwen3, LM planificador, DiT de difusión y VAE de audio) puede ejecutarse en hardware móvil con cuantización selectiva, manteniendo la licencia MIT del modelo original para uso comercial de las canciones generadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multi-componente: encoder de texto Qwen3-Embedding-0.6B + planificador LM autorregresivo de 1,7B + DiT de difusión + VAE decodificador de audio |
| Parametros totales | no disponible (el planificador LM es de 1,7B; el DiT no declara recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Planificador: Q4X (Q4I con capas 2 y 27 en Q8) y Q8; DiT: int8 r8 con escalas por bloque y bf16/fp16; encoder de texto, condition stack y VAE en 16 bits |
| Idiomas soportados | no disponible |
| Licencia | MIT (encoder Qwen3-Embedding-0.6B bajo Apache 2.0) |
| Formato de pesos | `.bin` propietario del motor Geode, con manifiesto `geode.json` (tamanos y SHA-256) |

## Arquitectura y entrenamiento

El pipeline sigue el diseno de ACE-Step 1.5: un encoder de texto Qwen3-Embedding-0.6B procesa el caption, un planificador LM de 1,7B (con decodificacion restringida mediante tablas FSM) genera la estructura de la cancion a 5 Hz, un condition stack codifica letra y timbre, un DiT de difusion sintetiza latentes de audio a 25 Hz y un VAE los decodifica a estereo de 48 kHz. La variante SFT usa 50 pasos de difusion con CFG 7 y APG con shift 3; el planificador muestrea con temperatura 0,85, CFG 2 y top-p 0,9.

La conversion no reentrena: preserva los valores de los checkpoints originales y solo cambia el layout y la precision. El cuerpo del planificador se cuantiza a Q4X (con las capas 2 y 27 en Q8), las matrices por paso del DiT a int8 con escalas por bloque (con copias separadas para CPU SDOT, NPU Hexagon HMX y GPU), mientras que encoder de texto, condition stack y VAE conservan 16 bits. Los detalles de entrenamiento original (tokens, composicion del dataset, RLHF/DPO) no se documentan en la informacion disponible.

## Capacidades

- Generacion de musica completa a partir de texto (caption) y letra, con salida estereo a 48 kHz.
- Planificacion estructurada de la cancion mediante LM autorregresivo con decodificacion restringida.
- Codificacion de timbre y letra para condicionar el estilo y la voz.
- Ejecucion on-device en Android sin conexion de red.
- Aprovechamiento de aceleracion por CPU (SDOT), NPU Hexagon (HMX) y GPU movil.
- Modo de difusion "mas exacta" en fp16 opcional para mayor fidelidad.
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada.

## Casos de uso

- Generacion musical offline en movil: el usuario compone captions y letras en la app Geode y el pipeline completo se ejecuta en el telefono, util en entornos sin conectividad o con requisitos estrictos de privacidad.
- Prototipado de bandas sonoras para videojuegos indie: el modelo SFT a 50 pasos produce la mejor calidad de audio del paquete, adecuada para maquetas de musica de fondo que luego se revisan en estudio.
- Creacion de jingles y demos comerciales: la licencia MIT permite usar las canciones generadas en produccion comercial sin restricciones adicionales.
- Investigacion en generacion musical on-device: sirve como referencia de pipeline cuantizado (Q4X/Q8/int8) ejecutable en hardware movil para comparar calidad frente a versiones en servidor.
- Educacion y talleres de IA generativa: al no requerir GPU ni infraestructura cloud, permite demostrar difusion y LM planificador en un telefono.
- Iteracion rapida de ideas musicales: el paquete turbo (8 pasos, sin CFG, en repo separado) complementa a este SFT para borradores rapidos antes de la generacion final con 50 pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: 4,99 GiB para el paquete compartido `acestep-1.5/` mas 1,71 GiB para `acestep-1.5-sft/`; opcionales de 1,84 GiB (`lm/ar_q8.bin`) y 2,62 GiB (`dit_sft_f16.bin`).
- Dispositivo objetivo: telefonos Android con motor Geode; el diseno contempla CPU con SDOT, NPU Hexagon (HMX) y GPU movil.
- VRAM/RAM estimada: no disponible de forma explicita; el paquete base supera los 6,7 GiB en disco, por lo que se requiere un dispositivo con memoria suficiente para cargar los componentes activos.
- GPU de escritorio: no aplica; el formato `.bin` es especifico de Geode y no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| Geode-ACE-Step-1.5 | Planificador 1,7B + DiT + VAE | no disponible | MIT | Solo app Geode (Android) | Conversion on-device del SFT de 50 pasos |
| Geode-ACE-Step-1.5-turbo | Planificador 1,7B + DiT + VAE | no disponible | MIT | Solo app Geode (Android) | Variante turbo de 8 pasos, sin CFG |
| ACE-Step 1.5 (original) | Planificador 1,7B + DiT + VAE | no disponible | MIT | Servidor/escritorio | Checkpoint de referencia sin conversion |

## Limitaciones y advertencias

- El formato de pesos es propietario de Geode: no es cargable en frameworks estandar como transformers, diffusers, vLLM o llama.cpp.
- La cuantizacion Q4X del planificador y int8 del DiT puede degradar la calidad musical frente al checkpoint original en bf16/fp16.
- La generacion SFT requiere 50 pasos con CFG 7, lo que implica mayor coste computacional en movil que la variante turbo.
- No se documentan idiomas soportados ni sesgos conocidos del modelo original.
- Riesgo de alucinacion en el planificador LM (estructuras musicales incoherentes o letras mal alineadas) mitigado parcialmente por la decodificacion restringida.
- La licencia MIT cubre las canciones generadas, pero el encoder Qwen3-Embedding-0.6B se distribuye bajo Apache 2.0 y debe respetarse su NOTICE.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Maximilian228/Geode-ACE-Step-1.5
- Variante turbo: https://huggingface.co/Maximilian228/Geode-ACE-Step-1.5-turbo
- Repositorio ACE-Step 1.5: https://github.com/ace-step/ACE-Step-1.5
- Organizacion ACE-Step en Hugging Face: https://huggingface.co/ACE-Step
- Modelo base ACE-Step 1.5: https://huggingface.co/ACE-Step/Ace-Step1.5
- Checkpoint SFT: https://huggingface.co/ACE-Step/acestep-v15-sft
- Planificador LM 1,7B: https://huggingface.co/ACE-Step/acestep-5Hz-lm-1.7B
- Encoder de texto Qwen3-Embedding-0.6B: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Paper: arXiv 2602.00744
