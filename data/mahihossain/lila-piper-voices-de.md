# mahihossain/lila-piper-voices-de

## Resumen

Lila – German Piper voices (offline) es un paquete de dos voces sinteticas en aleman para el motor de sintesis de voz Piper, publicado por el usuario mahihossain en HuggingFace. No se trata de un modelo de lenguaje ni de un transformer generativo de texto, sino de dos modelos acusticos exportados a ONNX que se ejecutan sobre el runtime Piper 2023.11.14-2. Fueron creados para "Lila", el asistente de voz del proyecto de investigacion DiGeWohl (Ostfalia), y estan pensados para funcionar en un Jetson montado sobre un perro robot Go2, a una velocidad similar a la voz de referencia `de_DE-thorsten-high`.

El repositorio contiene dos ficheros: `de_DE-lila_hokuspokus-high.onnx`, una voz femenina afinada sobre la lectora de dominio publico "Hokuspokus" del corpus HUI (LibriVox), y `de_DE-lila_neutral-high.onnx`, una voz de genero neutro obtenida por mezcla de pesos al 60 % de Thorsten high y 40 % de lila_hokuspokus high. Cada modelo incluye su fichero de configuracion `.onnx.json` y una model card con las fuentes exactas, hashes y receta de entrenamiento.

Su relevancia es acotada pero concreta: ofrece TTS aleman completamente offline, con un tamano de repositorio de 0,2 GB y un consumo de recursos bajo, adecuado para robots y dispositivos embebidos donde no se puede depender de servicios en la nube. No hay informacion publica sobre arquitectura interna, numero de parametros ni datos de entrenamiento mas alla de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo acustico Piper exportado a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (TTS, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (los ficheros se distribuyen en ONNX; variante "high") |
| Idiomas soportados | aleman (de) |
| Licencia | other / piper-derived (ver LICENSE del repositorio) |
| Formato de pesos | ONNX (`.onnx`) con configuracion `.onnx.json` |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna de los modelos. Por el formato y el runtime declarado (Piper 2023.11.14-2), se trata de modelos acusticos de sintesis de voz compatibles con Piper, distribuidos como ficheros ONNX acompanados de su configuracion JSON. La model card no especifica el tipo de red (por ejemplo, VITS u otra variante), el numero de parametros ni la composicion exacta del dataset de entrenamiento.

El proceso de creacion documentado es el siguiente: la voz `lila_hokuspokus` se afino sobre la lectora de dominio publico "Hokuspokus" del corpus HUI (LibriVox). La voz `lila_neutral` se obtiene por mezcla de pesos: 60 % de Thorsten high y 40 % de lila_hokuspokus high. La model card indica que cada fichero incluye una `MODEL_CARD` con las fuentes exactas, hashes y receta de entrenamiento, pero esos detalles no estan disponibles en la informacion proporcionada. No se menciona uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Sintesis de voz (text-to-speech) en aleman, offline, sobre el runtime Piper.
- Dos voces: una femenina (`de_DE-lila_hokuspokus-high`) y una de genero neutro (`de_DE-lila_neutral-high`).
- Ejecucion en dispositivos embebidos: la model card indica funcionamiento en un Jetson (perro robot Go2) a velocidad comparable a `de_DE-thorsten-high`.
- Integracion por linea de comandos mediante `piper`, con entrada por stdin y salida a fichero WAV.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada.
- No es multilingue: unicamente aleman.

## Casos de uso

- Asistente de voz en robotica embebida: el modelo esta disenado para el asistente "Lila" del proyecto DiGeWohl y se ejecuta en un Jetson sobre un Go2, por lo que encaja en escenarios de robotica movil con requisitos de baja latencia y sin conexion a la nube.
- Interfaces de voz offline en dispositivos sin red: al ser modelos ONNX ejecutados localmente con Piper, permiten generar respuestas habladas en aleman en entornos aislados o con conectividad limitada.
- Kioscos y terminales de atencion en aleman: la voz neutra puede emplearse en mensajes informativos y avisos donde se prefiera una locucion sin marca de genero.
- Sistemas de accesibilidad: lectura en voz alta de textos y notificaciones en aleman para usuarios con discapacidad visual, con despliegue local y sin coste por peticion.
- Prototipado de asistentes conversacionales: combinado con un LLM y un motor de reconocimiento de voz, sirve como capa de sintesis para prototipos de dialogo en aleman.
- Investigacion en interaccion humano-robot: las dos voces permiten estudiar percepcion de genero y naturalidad en estudios con usuarios, al estar ambas disponibles bajo el mismo runtime y con receta documentada.
- Generacion de locuciones para pruebas y demos: su tamano reducido (repositorio de 0,2 GB) facilita incluirlo en pipelines de integracion y en entornos de CI para generar audio de prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica referencia de rendimiento es cualitativa: la model card indica que las voces corren en un Jetson a aproximadamente la velocidad de `de_DE-thorsten-high`. No se proporcionan valores de latencia, RTF ni MOS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ejecutarse sobre Piper en ONNX, el consumo es bajo y propio de modelos TTS ligeros, pero no se publican cifras.
- GPU recomendadas: no disponible. La model card menciona ejecucion en un Jetson (plataforma embebida de NVIDIA) sobre un perro robot Go2.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el runtime Piper esta pensado para CPU y dispositivos de bajos recursos.
- Opciones de despliegue: binario `piper` (runtime 2023.11.14-2) con modelos ONNX; ejemplo de uso: `echo "Guten Morgen! Ich bin Lila." | piper --model de_DE-lila_hokuspokus-high.onnx --output_file out.wav`.
- Latencia y throughput: no disponibles; solo la referencia cualitativa de velocidad similar a `de_DE-thorsten-high` en Jetson.

## Comparativa con modelos similares

| Modelo | Idioma | Formato | Runtime | Licencia | Notas |
|---|---|---|---|---|---|
| lila-piper-voices-de (este modelo) | de | ONNX | Piper 2023.11.14-2 | piper-derived | Dos voces (femenina y neutra), orientado a robotica embebida |
| de_DE-thorsten-high (Piper) | de | ONNX | Piper | piper-derived | Voz de referencia citada por el autor; usada como base de la mezcla al 60 % |
| Otras voces Piper en aleman | de | ONNX | Piper | piper-derived | No se dispone de datos comparativos de rendimiento en la informacion proporcionada |

No se dispone de datos de benchmarks ni de parametros para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Solo soporta aleman; no es un modelo multilingue.
- No es un modelo de lenguaje: no genera texto, razona ni ejecuta tool calling; unicamente sintetiza voz a partir de texto.
- La licencia es "other" con nombre "piper-derived"; es necesario revisar el fichero LICENSE del repositorio para conocer las condiciones exactas de uso comercial y de redistribucion.
- La voz neutra es una mezcla de pesos (60/40) de dos voces, no un modelo entrenado especificamente para ese fin; su comportamiento puede heredar caracteristicas de ambas fuentes.
- No se publican datos sobre sesgos, calidad perceptual (MOS) ni robustez ante textos fuera de dominio.
- El repositorio tiene un uso muy bajo (58 descargas, 0 likes) y fue creado en octubre de 2026 segun los metadatos; no hay evidencia de mantenimiento o validacion por terceros.
- Depende de una version concreta del runtime Piper (2023.11.14-2); cambios de version podrian afectar a la compatibilidad de los ficheros ONNX.
- No se dispone de informacion sobre el proceso de entrenamiento mas alla de la receta resumida en la model card.

## Enlaces

- HuggingFace: https://huggingface.co/mahihossain/lila-piper-voices-de
- Piper (runtime): https://github.com/rhasspy/piper
- Licencia del repositorio: https://huggingface.co/mahihossain/lila-piper-voices-de/blob/main/LICENSE
- Corpus HUI / LibriVox (referenciado en la model card, sin enlace directo en la informacion disponible): no disponible
- Proyecto DiGeWohl (Ostfalia) (referenciado en la model card, sin enlace directo en la informacion disponible): no disponible
