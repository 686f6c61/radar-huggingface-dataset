# HY-2012/opusBWE.AXERA

## Resumen

OpusBWE.AXERA es un paquete de inferencia para extension de ancho de banda (bandwidth extension, BWE) de audio de 16 kHz a 48 kHz, optimizado para la NPU AX650 de AXERA. Lo publica el usuario HY-2012 y se distribuye como un repositorio autocontenido que incluye el modelo compilado (`bwe_feature_net.axmodel`, 288 KB), un ejecutable C++ para aarch64 con el DSP de sintesis de Opus embebido, un envoltorio en Python y muestras de audio. No es un modelo de lenguaje ni un transformer generativo: es una red neuronal pequena (convoluciones, GRU y convolucion transpuesta) que estima las componentes de alta frecuencia que faltan en una senal de voz de banda estrecha.

El modelo base declarado es `xiph/opus`, en concreto los pesos OSCE-BWE (`bbwenet_v2.pth`) del codec Opus. La aportacion del repositorio es el despliegue sobre NPU: cuantizacion a S8 en pesos y U16 en activaciones, compilacion a formato `.axmodel` y una cadena C++ que combina la red neuronal con el procesado DSP de Opus para reconstruir la senal a 48 kHz. Segun la model card, el factor de tiempo real (RTF) medido en una placa AX650 con BSP V3.10.2 es de 0.099 en C++, es decir, unas 10 veces mas rapido que tiempo real procesando tramas de 20 ms (320 muestras de entrada, 960 de salida).

Su relevancia practica esta en el coste: 288 KB de modelo y 2,3 MB de ejecutable permiten anadir mejora de banda ancha a pipelines de telefonia, VoIP o transcripcion embebida sin GPU ni servidor. La licencia del repositorio es Apache-2.0, mientras que el codigo y los pesos upstream de Opus son BSD-3-Clause, lo que conviene verificar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional recurrente (conv1/conv2/GRU/tconv) compilada para NPU AX650, combinada con DSP de sintesis Opus |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (procesa tramas de 20 ms, 320 muestras a 16 kHz) |
| Tipos de cuantizacion | Actividades U16, pesos S8 (formato `.axmodel`) |
| Idiomas soportados | en, zh (segun metadatos; el modelo opera sobre senal de voz, no sobre texto) |
| Licencia | Apache-2.0 (repositorio); upstream Opus y OSCE-BWE en BSD-3-Clause |
| Formato de pesos | `.axmodel` (288 KB) + ejecutable C++ aarch64 (2,3 MB) |
| Frecuencia de entrada | 16 kHz mono, wav |
| Frecuencia de salida | 48 kHz fija |
| Tamano del repositorio | 0,0 GB (segun Hugging Face) |
| Libreria | axera |

## Arquitectura y entrenamiento

La red `bwe_feature_net` sigue el esquema OSCE-BWE de Opus: dos capas convolucionales que extraen caracteristicas espectrales de la senal de 16 kHz, una GRU que modela la dinamica temporal y una convolucion transpuesta que proyecta la representacion a la resolucion necesaria para la sintesis a 48 kHz. El modelo no genera la forma de onda directamente; produce parametros que el DSP de Opus utiliza para reconstruir las bandas altas. La compilacion a `.axmodel` fija activaciones en U16 y pesos en S8 para ejecutarse en la NPU del AX650.

No se detallan en la informacion disponible el numero de parametros, el volumen de datos de entrenamiento, la composicion del corpus ni si hubo etapas de ajuste fino adicionales. Los pesos proceden de `bbwenet_v2.pth` del proyecto xiph/opus, por lo que el entrenamiento original corresponde al esquema OSCE-BWE publicado por Xiph.Org. La innovacion del repositorio es de despliegue: empaquetado autocontenido, cadena C++ con el DSP de Opus integrado y una latencia por trama de 20 ms compatible con comunicacion en tiempo real.

## Capacidades

- Extension de ancho de banda de audio: convierte voz de 16 kHz a 48 kHz reconstruyendo las frecuencias altas ausentes.
- Mejora de inteligibilidad y naturalidad en senales telefonicas o de banda estrecha.
- Procesamiento en tiempo real por tramas de 20 ms con RTF de 0,099 en C++ sobre AX650.
- Ejecucion en NPU embebida (AX650) sin GPU ni servidor; tambien disponible un envoltorio Python que invoca el binario C++.
- Entrada y salida en ficheros wav mono; entrada obligatoriamente a 16 kHz, salida fija a 48 kHz.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni generacion de texto: es un modelo de audio-audio especializado.
- Idiomas declarados en metadatos: ingles y chino; al operar sobre senal de voz, la cobertura linguistica depende de los datos de entrenamiento upstream, no documentados aqui.

## Casos de uso

- Telefonia VoIP y centralitas: insertar el modelo tras el decodificador de un codec de banda estrecha para entregar audio a 48 kHz al usuario final, con coste de computo minimo en el propio dispositivo.
- Transcripcion automatica del habla en embebido: preprocesar audio telefonico a 48 kHz antes de un ASR que se beneficie de mayor ancho de banda, ejecutando todo en la misma placa AX650.
- Dispositivos de conferencia y altavoces inteligentes: mejorar la calidad percibida de la voz captada por microfonos de banda limitada sin anadir un SoC con GPU.
- Pipelines de grabacion y archivo: restaurar grabaciones historicas o de baja tasa de muestreo a 48 kHz para su publicacion o analisis posterior.
- Sistemas de atencion al cliente con IVR: mejorar la senal antes de la reproduccion o del envio a un motor de sintesis, reduciendo la sensacion de "voz telefonica".
- Pruebas de calidad y evaluacion de codecs: usar el modelo como referencia de BWE en comparativas A/B y en la validacion de cadenas de audio en produccion.
- Integracion en firmware de camaras IP o intercomunicadores: el tamano de 288 KB y el binario de 2,3 MB permiten incluirlo en imagenes de sistema con espacio limitado.

## Benchmarks y rendimiento

La model card solo publica medidas de velocidad, no de calidad objetiva (PESQ, STOI, ViSQOL) ni comparativas con otros sistemas de BWE.

| Metrica | Entorno | Valor |
|---|---|---|
| RTF (C++, NPU + DSP Opus) | AX650, BSP V3.10.2, trama de 20 ms | 0,099 |
| RTF (envoltorio Python) | AX650, mismo pipeline | ≈ 0,10 |
| Tamano del modelo | `.axmodel` | 288 KB |
| Tamano del ejecutable | `bin/bwe_ax650` (aarch64) | 2,3 MB |

No se han publicado resultados de benchmarks de calidad de audio en la informacion disponible.

## Requisitos de hardware

- NPU AXERA AX650 con BSP V3.10.2 (entorno en el que se midio el RTF); no se documenta compatibilidad con otras NPU de la familia AXERA.
- CPU aarch64 para el ejecutable C++; el modelo no esta pensado para x86 ni para GPU convencionales.
- VRAM: no aplica; el modelo se ejecuta en la NPU y no requiere memoria de GPU dedicada.
- No cabe ni esta previsto para GPU de consumo (RTX 4090, etc.): el artefacto es un binario especifico de la NPU.
- Despliegue mediante el script `run_ax650.sh` incluido en el paquete, con modo C++ por defecto y modo Python opcional (`--python`).
- No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia: procesamiento por tramas de 20 ms; con RTF 0,099 el coste de computo por trama es de aproximadamente 2 ms.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada/salida | Despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpusBWE.AXERA | BWE neuronal + DSP Opus | 16 kHz → 48 kHz | NPU AX650 | Apache-2.0 (repo), BSD-3-Clause (upstream) | Hugging Face y GitHub |
| OSCE-BWE (xiph/opus, `bbwenet_v2.pth`) | BWE neuronal de referencia | 16 kHz → 48 kHz | CPU/GPU generica | BSD-3-Clause | Repositorio de Xiph.Org |
| Opus estandar (BWE clasico) | DSP sin red neuronal | banda estrecha → banda ancha | CPU | BSD-3-Clause | Ampliamente distribuido |

No se dispone de datos publicados de calidad (PESQ, STOI) que permitan comparar el rendimiento objetivo de OpusBWE.AXERA frente a OSCE-BWE u otras alternativas de BWE en la informacion proporcionada.

## Limitaciones y advertencias

- Solo acepta wav de 16 kHz mono; cualquier otra frecuencia de entrada o configuracion multicanal queda fuera del contrato documentado.
- La salida es siempre 48 kHz; no hay control de la tasa de salida ni modo de banda intermedia.
- No se publican metricas de calidad de audio (PESQ, STOI, ViSQOL), por lo que la mejora real frente al audio original no esta cuantificada en la model card.
- Dependencia de hardware: el `.axmodel` y el binario estan compilados para AX650 con BSP V3.10.2; no hay artefactos para otras plataformas.
- El repositorio figura con 0 descargas y 0 likes y un tamano reportado de 0,0 GB, lo que sugiere un paquete poco validado por la comunidad; conviene verificar la integridad de los ficheros antes de usarlo en produccion.
- Riesgo de artefactos y alucinacion espectral: la red puede inventar contenido de alta frecuencia en senales no vocales o con ruido, degradando la fidelidad.
- Sesgos linguisticos y de dominio no documentados: los metadatos declaran en y zh, pero no se especifica la composicion del corpus de entrenamiento ni su cobertura de acentos, edades o tipos de voz.
- Licencia: el repositorio es Apache-2.0, pero el codigo y los pesos upstream de Opus son BSD-3-Clause; hay que conservar los avisos de copyright correspondientes en una redistribucion comercial.
- La model card esta redactada en chino e ingles; no hay documentacion en castellano ni guia de integracion mas alla de los scripts incluidos.

## Enlaces

- Hugging Face: https://huggingface.co/HY-2012/opusBWE.AXERA
- GitHub del proyecto: https://github.com/ZY-2012/opusBWE.AXERA
- Repositorio upstream de Opus: https://github.com/xiph/opus
