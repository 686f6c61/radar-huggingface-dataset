# AXERA-TECH/MiniCPM-OCR-1.0-AX8860-llama.cpp

## Resumen

MiniCPM-OCR-1.0 es un modelo especializado en reconocimiento óptico de caracteres (OCR) desarrollado por OpenBMB, distribuido aquí por AXERA-TECH en una variante optimizada para el acelerador NPU AX8860 mediante llama.cpp y el backend ggml-axera. El modelo resuelve la transcripción de texto en chino e inglés a partir de documentos, tablas y capturas de pantalla, combinando un codificador visual con un modelo de lenguaje de aproximadamente 752 millones de parámetros totales.

Esta ficha concreta no es el modelo original, sino un paquete de despliegue para hardware de borde: incluye pesos en formato GGUF (texto en bf16 de 1,52 GB y codificador visual de 0,9 GB), kernels compilados para la NPU, binarios estáticos de llama.cpp y scripts de ejecución y benchmark. El modelo base es openbmb/MiniCPM-OCR-1.0, sobre el que AXERA aplica conversión a MXFP8 en carga para los pesos de texto y mantiene la caché KV en BF16.

Su relevancia radica en demostrar inferencia OCR multimodal en un SoC NPU de bajo consumo con latencias de 1,62 s por imagen (mediana, extremo a extremo) y velocidades de decodificación de 143,4 tokens/s en OCR, además de exponer un servidor compatible con la API de OpenAI. La longitud de contexto está fijada en 4096 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador visual + modelo de lenguaje); detalles internos no disponibles |
| Parametros totales | 752.167.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Pesos GGUF en BF16; conversion a MXFP8 en carga para texto; cache KV en BF16; vision en BF16 |
| Idiomas soportados | Chino e ingles (segun la model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (texto: `gguf/minicpm-ocr-1.0-bf16.gguf`; vision: `gguf/mmproj-minicpm-ocr-1.0-bf16.gguf`) |

## Arquitectura y entrenamiento

La informacion disponible describe el paquete de despliegue, no la arquitectura interna del modelo base. Se trata de un modelo multimodal compuesto por un codificador visual (empaquetado por separado como `mmproj`, 0,9 GB en BF16) y un modelo de lenguaje de 752 millones de parametros (1,52 GB en BF16), ejecutados sobre llama.cpp con kernels especificos para la NPU AX8860. En carga, los pesos de texto del GGUF se convierten a MXFP8 y la cache KV se mantiene en BF16; los pesos visuales permanecen en BF16.

No se han publicado en la informacion proporcionada datos sobre volumen de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO o tecnicas de alineacion. Tampoco se detalla si emplea decodificacion especulativa u otras optimizaciones de atencion. La innovacion tecnica destacable de este paquete es la integracion de tres kernels NPU (prefill de texto, decode de texto con cabeza de salida, y codificador visual) junto con un `manifest.json`, que permiten ejecutar el pipeline completo en el SoC AX8860 con un consumo de memoria NPU de 2,08 GiB tras la carga y 3,01 GiB en pico.

## Capacidades

- OCR de documentos, tablas y capturas de pantalla en chino e ingles.
- Reconocimiento de texto a partir de imagenes, con prompts como "Text Recognition:".
- Procesamiento por lotes de directorios de imagenes PNG mediante `run.sh -b`.
- Generacion de texto y completado de texto (por ejemplo, `run.sh "The capital of France is" 64`).
- Servidor compatible con la API de OpenAI (`run.sh -s 8080`), con plantilla de chat incluida (`chat_template.jinja`).
- Modo de razonamiento configurable; desactivado por defecto en el servidor (`--reasoning off`).
- Soporte de prompt cache (probado con 160 peticiones sin errores de cache).
- Capacidad conversacional (etiqueta `conversational` en Hugging Face).

## Casos de uso

- Digitalizacion de documentos en el borde: el modelo transcribe documentos escaneados en chino e ingles directamente en el dispositivo AX8860, sin enviar imagenes a la nube, con una latencia mediana de 1,62 s por imagen.
- Procesamiento de tablas y formularios: la capacidad OCR permite extraer contenido tabular de capturas y documentos, adecuada para pipelines de ingestion de datos en entornos con conectividad limitada.
- Extraccion de texto de capturas de pantalla: util en herramientas de accesibilidad o monitorizacion que necesitan convertir capturas en texto estructurado en tiempo real.
- Servicio OCR interno con API compatible con OpenAI: el servidor integrado permite sustituir llamadas a APIs externas por un endpoint local en la red, reduciendo costes y dependencias.
- Procesamiento por lotes en dispositivos de borde: `run.sh -b` recorre directorios de imagenes y lanza una peticion por imagen contra un servidor temporal, idoneo para digitalizacion masiva en campo.
- Automatizacion documental en kioscos o terminales: con memoria NPU pico de 3,01 GiB y 182 MiB de RSS en carga, el modelo cabe en dispositivos empotrados para lectura de documentos de identidad, tickets o etiquetas.
- Asistencia a la lectura con completado de texto: la faceta de modelo de lenguaje (154,9 tokens/s en decode de texto) permite tareas auxiliares de correccion o completado sobre el texto extraido.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Peticion de imagen extremo a extremo (mediana) | 1,62 s (encode + prefill + generacion) |
| Decode OCR | 143,4 tokens/s |
| Decode de texto | 154,9 tokens/s |
| Prefill de prompt de 4k | 7784 tokens/s (3908 tokens en 0,50 s) |
| Prompt de 5 tokens | 0,03 s, decode 154,9 tokens/s |
| Prompt de 3908 tokens | 0,50 s, decode 143,9 tokens/s (128 tokens generados) |
| Codificacion de imagen | 1,61 s (`doc_en.png`, 1782 tokens de imagen) |
| Memoria NPU (CMM) tras carga | 2,08 GiB |
| Memoria NPU (CMM) pico | 3,01 GiB |
| RSS de host tras carga | 182 MiB |
| RSS de host pico | 868 MiB |
| Perplejidad de texto en placa | 174,56 (referencia CPU: 172,74; +1,05%) |
| Prueba de estres de prompt cache | 160 peticiones, 0 errores |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- NPU AXERA AX8860 obligatoria, con SDK V0.5.1 o superior.
- Memoria NPU: 2,08 GiB tras la carga, 3,01 GiB en pico (CMM).
- Memoria de host: 182 MiB tras la carga, 868 MiB en pico (RSS).
- El modelo ocupa los 4 nucleos de la NPU en tiempo de ejecucion; el servidor se ejecuta con `-np 1`.
- No cabe en GPU consumer convencionales: los binarios de `bin/` son programas estaticos para la placa AX8860, no builds genericos de llama.cpp para CUDA o CPU.
- Opciones de despliegue: `run.sh` para inferencia de una imagen, por lotes o como servidor compatible con OpenAI en el puerto indicado (8080 por defecto); `bench.sh` para reproducir el benchmark con `-c 4096` y decodificacion voraz (mediana de 3 ejecuciones).
- Latencia y throughput: 1,62 s por imagen extremo a extremo, 143,4 tokens/s en decode OCR y 7784 tokens/s en prefill de 4k.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM-OCR-1.0-AX8860-llama.cpp (esta ficha) | 752 M | 4096 | NPU AX8860, llama.cpp | no disponible | Paquete GGUF + kernels NPU; OCR chino/ingles |
| openbmb/MiniCPM-OCR-1.0 (modelo base) | 752 M | no disponible | Generico (transformers, llama.cpp) | no disponible | Modelo original del que deriva este paquete |
| Alternativas OCR de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Solo soporta chino e ingles segun la model card; otros idiomas no estan cubiertos.
- Contexto fijo de 4096 tokens; el prompt mas largo entre las 10 imagenes incluidas es de 1830 tokens, lo que deja margen limitado para documentos extensos o multiples imagenes por peticion.
- Dependencia estricta de hardware: requiere una NPU AX8860 con SDK V0.5.1 o superior; los binarios son estaticos y especificos de la placa, por lo que no son portables a otras plataformas.
- La licencia no esta disponible en la informacion proporcionada, por lo que no puede confirmarse el uso comercial; debe verificarse en el repositorio del modelo base.
- Los archivos descargados de Hugging Face no tienen permisos de ejecucion; es necesario invocarlos con `sh`.
- El modo de razonamiento esta desactivado por defecto en el servidor; su activacion puede alterar latencia y calidad de salida.
- Riesgo de alucinacion inherente a los modelos de lenguaje: en tareas OCR puede generar texto plausible no presente en la imagen, especialmente con documentos de baja calidad o dominios no representados.
- Las imagenes de prueba se generaron con la fuente Noto CJK y su referencia esta en `images/reference.json`; el rendimiento en documentos reales con ruido, rotaciones o fuentes manuscritas no esta documentado.
- La perplejidad de texto en placa (174,56) es un 1,05% superior a la referencia CPU (172,74), lo que indica una ligera degradacion numerica por la conversion a MXFP8.
- No se han publicado sesgos conocidos ni evaluaciones de robustez en la informacion disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AXERA-TECH/MiniCPM-OCR-1.0-AX8860-llama.cpp
- Modelo base: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- Fork de llama.cpp utilizado (ZHEQIUSHUI, commit `1970d6c5d`): https://github.com/ZHEQIUSHUI/llama.cpp
