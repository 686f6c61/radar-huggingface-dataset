# AXERA-TECH/VoxCPM2-AX8860-llama.cpp

## Resumen

VoxCPM2-AX8860-llama.cpp es un paquete de despliegue preparado por AXERA-TECH para ejecutar el modelo de sintesis de voz VoxCPM2 (desarrollado originalmente por OpenBMB) sobre la NPU de cuatro nucleos del SoC Axera AX8860, utilizando una bifurcacion de llama.cpp con soporte para el backend ggml-axera. No se trata de un modelo nuevo, sino de una cuantizacion y empaquetado del modelo base openbmb/VoxCPM2 en formato GGUF F16, acompanado de binarios estaticos, kernels de NPU y scripts de ejecucion y benchmark.

El modelo resuelve el problema de servir sintesis de voz con clonacion de voz zero-shot en hardware de borde (edge), sin GPU dedicada, exponiendo una API compatible con el endpoint `/v1/audio/speech` de OpenAI. Con aproximadamente 912 millones de parametros, el paquete se divide en dos ficheros GGUF: un modelo de lenguaje base (3,2 GB) y una parte acustica (1,8 GB), con un consumo de memoria en NPU de unos 3,0 GB y 6,3 GB de RSS en host.

Su relevancia actual radica en que demuestra la viabilidad de ejecutar TTS neuronal de calidad con clonacion de voz sobre aceleradores NPU de bajo consumo, con latencias de primer paquete de audio de 0,18-0,20 s y un factor de tiempo real (RTF) en torno a 0,27, lo que permite generacion mas rapida que el tiempo real en un dispositivo empotrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base VoxCPM2; el paquete incluye un language model base y un modulo acustico con decodificador VAE de audio y bucle de difusion) |
| Parametros totales | 912.440.644 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 8192 tokens (valor de `-c` usado en el servidor de ejemplo) |
| Tipos de cuantizacion | F16 (ambos ficheros GGUF) |
| Idiomas soportados | No disponible oficialmente; los benchmarks y pruebas cubren ingles y chino |
| Licencia | No disponible |
| Formato de pesos | GGUF (F16) |

## Arquitectura y entrenamiento

El paquete no documenta la arquitectura interna del modelo base VoxCPM2 mas alla de su descomposicion funcional. Se distribuyen dos componentes: un modelo de lenguaje base (`VoxCPM2-BaseLM-F16.gguf`, 3,2 GB) y una parte acustica (`VoxCPM2-Acoustic-F16.gguf`, 1,8 GB) que incluye un decodificador VAE de audio y un bucle de difusion con nueve pasos Euler. La generacion de audio combina el modelado de lenguaje con un proceso de difusion para producir la forma de onda, y admite clonacion de voz zero-shot a partir de una grabacion de referencia.

El despliegue sobre AX8860 se apoya en ocho kernels de NPU especificos: prefill del modelo de lenguaje (con paginas de 256 y 16 tokens), decode del modelo de lenguaje, modelo de lenguaje residual (con post-procesado y cabeza de parada), codificador local, bucle de difusion (los nueve pasos Euler en una sola llamada), y decodificador y codificador VAE de audio. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles y chino segun las pruebas publicadas.
- Clonacion de voz zero-shot mediante `ref_audio` (WAV en base64) y, opcionalmente, `ref_text` con la transcripcion de la referencia.
- Salida en streaming: primer paquete de audio en 0,18 s (ingles) y 0,20 s (chino).
- API compatible con OpenAI: endpoint `/v1/audio/speech` con formatos `wav` y `pcm`.
- Parametros de inferencia ajustables por peticion: `seed`, `max_steps`, `inference_timesteps`, `cfg_value`, `temperature`.
- Procesamiento por peticiones serializado (`-np 1`), sin soporte documentado de batching concurrente.
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada mas alla de la referencia de clonacion.

## Casos de uso

- Asistentes de voz en dispositivos empotrados: el modelo cabe en unos 3,0 GB de memoria NPU y 6,3 GB de RSS en host, por lo que puede integrarse en equipos de borde sin GPU dedicada para dar respuestas habladas en tiempo real con RTF cercano a 0,27.
- Clonacion de voz personalizada en aplicaciones de accesibilidad: a partir de una muestra de referencia y su transcripcion, se puede generar voz sintetica con el timbre del usuario para lectores de pantalla o comunicadores aumentativos.
- Generacion de locuciones para contenido audiovisual: sintesis de frases largas (hasta 32 s de audio en las pruebas) con transcripcion verificada, adecuada para narraciones y doblaje de baja latencia.
- Interfaces conversacionales con streaming: el primer paquete de audio en menos de 0,2 s permite iniciar la reproduccion antes de completar la frase, mejorando la percepcion de respuesta en asistentes telefonicos o kioscos.
- Servicios de TTS autoalojados compatibles con OpenAI: al exponer `/v1/audio/speech`, puede sustituir a APIs en la nube en despliegues que ya usan el SDK de OpenAI, sin cambiar el codigo cliente.
- Prototipado e investigacion en TTS sobre NPU: los scripts `bench.sh` y `run.sh`, junto con los kernels y el manifiesto, permiten reproducir metricas y validar variantes de inferencia en el propio dispositivo AX8860.

## Benchmarks y rendimiento

Datos de rendimiento del autor (AX8860, NPU de 4 nucleos, modo servidor, extremo a extremo, generados con `./bench.sh`):

| Peticion | Audio | Tiempo | RTF |
|---|---:|---:|---:|
| Ingles, corto | 3,36 s | 0,93 s | 0,276 |
| Chino, corto | 3,20 s | 0,92 s | 0,286 |
| Ingles, medio | 8,16 s | 2,21 s | 0,270 |
| Chino, medio | 8,48 s | 2,34 s | 0,276 |
| Ingles, largo | 22,24 s | 6,00 s | 0,270 |
| Chino, largo | 32,00 s | 8,58 s | 0,268 |

| Metrica | Resultado |
|---|---|
| Primer audio en streaming | 0,18 s (ingles), 0,20 s (chino) |
| Tiempo hasta servidor listo | 62,5 s |
| Memoria NPU (CMM) | ~3,0 GB |
| Memoria host (RSS) | ~6,3 GB |
| Estabilidad | Memoria plana en 60 peticiones mixtas (mitad con clonacion) |

No se han publicado resultados de benchmarks de calidad (MOS, WER, similitud de hablante) ni comparaciones con otros modelos en la informacion disponible. La validacion de correctitud se limita a la transcripcion con Qwen3-ASR de 55 clips (11 textos en chino e ingles, cinco semillas cada uno), sin perdidas ni repeticiones de frases.

## Requisitos de hardware

- Hardware objetivo: SoC Axera AX8860 con NPU de cuatro nucleos y runtime del SDK en `/opt/lib`.
- Memoria: aproximadamente 3,0 GB de memoria NPU (CMM) y 6,3 GB de RSS en host.
- Almacenamiento: repositorio de 5,1 GB; los pesos GGUF suman 5,0 GB (3,2 GB + 1,8 GB).
- No esta pensado para GPU de consumo (RTX 4090) ni para A100/H100: los binarios son estaticos para la placa y los kernels estan compilados para la NPU del AX8860.
- Despliegue: `llama-server` y `llama-tts` incluidos en `bin/`, con `run.sh` y `bench.sh`; requiere `curl` en la placa para las pruebas de API.
- Exclusividad: consume los cuatro nucleos NPU, por lo que no deben ejecutarse otros programas de NPU en paralelo.
- Latencia y throughput: RTF de 0,27-0,29 y primer paquete de audio de 0,18-0,20 s; las peticiones se atienden de una en una (`-np 1`).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de TTS ni con otras implementaciones de VoxCPM2 (por ejemplo, la implementacion oficial en CPU mencionada en la model card). Como referencia interna, el autor senala que los resultados de transcripcion coinciden con la implementacion oficial en CPU de VoxCPM2, pero no se aportan cifras de rendimiento de esa variante.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial del modelo base ni del empaquetado; es imprescindible verificar la licencia de openbmb/VoxCPM2 antes de produccion.
- Idiomas no declarados oficialmente: las pruebas solo cubren chino e ingles; el comportamiento en castellano u otros idiomas no esta validado.
- Sin soporte de concurrencia: el servidor se ejecuta con `-np 1` y atiende peticiones de forma serial, lo que limita el throughput en escenarios multiusuario.
- Exclusividad de hardware: ocupa los cuatro nucleos NPU del AX8860; no puede convivir con otras cargas de NPU.
- Dependencia de hardware y SDK especificos: los binarios son estaticos y los kernels estan compilados para AX8860; no es portable a otras plataformas sin recompilar.
- Riesgo de alucinacion acustica: como todo sistema de TTS generativo, puede producir prosodia incorrecta, artefactos o pronunciaciones erroneas en textos fuera de dominio; no se publican metricas de calidad subjetiva (MOS) ni de error de palabra.
- Clonacion de voz: implica riesgos de suplantacion y uso indebido; requiere consentimiento explicito de la persona cuya voz se clona y controles de abuso en produccion.
- Sin datos sobre sesgos: no se documentan sesgos de genero, acento o idioma en el modelo base.
- Memoria plana verificada solo en 60 peticiones: no hay pruebas de estabilidad en ejecuciones prolongadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AXERA-TECH/VoxCPM2-AX8860-llama.cpp
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Bifurcacion de llama.cpp utilizada: https://github.com/ZHEQIUSHUI/llama.cpp (commit `14fcd6e3b`)
