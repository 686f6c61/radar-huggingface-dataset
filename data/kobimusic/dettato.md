# kobimusic/dettato

## Resumen

Dettato es el transcriptor de notas del sistema de transcripción automática de audio a MIDI multi-instrumento Dettato, desarrollado por KobiMusic (usuario kobimusic). Convierte cualquier grabación (banda, orquesta, piano, voz) en notas con onset, final y altura sobre las 88 teclas del piano, admitiendo hasta dos notas simultáneas en la misma tecla cuando dos instrumentos tocan la misma altura. Es la primera pieza de una cadena de cuatro modelos que incluye reparación de notas, agrupación por instrumento y detección de percusión.

El modelo es una red de "carriles" pitch-equivariante de 15,3 millones de parámetros, una arquitectura convolucional tipo ConvNeXt con atención axial sobre altura y tiempo, más una GRU bidireccional por carriles. Trabaja sobre un espectrograma logarítmico armónico de audio a 16 kHz con 10 ms de salto y decodifica notas por peak picking sobre mapas de probabilidad a 20 ms por frame.

Su relevancia radica en que obtiene un rendimiento compuesto de 59,2 en nueve conjuntos de benchmark públicos frente a 45,1 de MuScriptor, un modelo de 1,3B de parámetros, con dos órdenes de magnitud menos de parámetros. Está publicado con licencia Apache 2.0 y pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional de carriles pitch-equivariante (ConvNeXt-style) con atención axial y GRU bidireccional |
| Parametros totales | 15.299.474 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa ventanas de 8 s cada 2 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de audio, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, `config.json`) |

## Arquitectura y entrenamiento

El front end construye un espectrograma logarítmico armónico de audio a 16 kHz con 3 bins por semitono desde A0 y un canal por armónico entre 0,5 y 7, de modo que cada armónico de una nota cae en el bin de la propia nota, más un canal de ventana corta para ataques agudos, con salto de 10 ms. El stem aplica dos convoluciones 3x3 y una convolución con stride hasta una rejilla de frames de 20 ms con un carril por semitono.

El tronco tiene 368 canales y 15 bloques de carriles estilo ConvNeXt a 40 ms, con convolución depthwise dilatada a lo largo del tiempo y mezcla dispersa de alturas en ±1, 2, 12, 19, 24, 28 y 31 semitonos, atención axial sobre altura (relativa, equivariante a transposición) y sobre tiempo (rotatoria), más una GRU bidireccional de carriles tras los bloques 5, 10 y 15, y dos bloques de refinado que devuelven la resolución a 20 ms. Las cabezas producen probabilidades de onset, frame y offset para cada una de las 88 teclas, con dos voces por tecla.

La decodificación usa peak picking con umbrales fijos (onset 0,25; segunda voz 0,30; offset 0,30; frame 0,40) y cada nota conserva su probabilidad de onset como confianza. La información disponible no detalla el volumen de tokens ni la composición exacta del dataset de entrenamiento, aunque sí se menciona un fine-tune específico para voz cantada que mejora el recall de onset de melodía principal (RWC Popular de 57,8 a 67,4; RWC Genre de 45,5 a 54,4; RWC Royalty-Free de 69,8 a 76,3). No se documenta el uso de RLHF o DPO.

## Capacidades

- Transcripción de audio a notas: genera onset, final y altura MIDI sobre las 88 teclas del piano (A0-C8).
- Polifonía multi-instrumento: admite hasta dos notas simultáneas en la misma tecla (dos voces por tecla).
- Detección de ataques agudos mediante canal de ventana corta en el front end.
- Procesamiento por ventanas solapadas de 8 s cada 2 s con promediado ponderado por Hann por frame.
- Salida de seis mapas de probabilidad (frames x 88) a 20 ms por frame y decodificación a notas con confianza.
- Fine-tune específico para voz cantada (melodía principal).
- No incluye etiquetado de instrumentos (lo aporta dettato-grouper) ni percusión (la aporta dettato-drums).
- No dispone de tool calling, function calling ni capacidades de agente; no es un modelo de lenguaje.

## Casos de uso

- Transcripción de grabaciones de banda u orquesta a MIDI: el modelo procesa la mezcla completa en ventanas de 8 s y devuelve notas con altura y tiempo, útil como paso previo a la edición en un DAW.
- Digitalización de interpretaciones de piano: con las 88 teclas cubiertas y tolerancia de 50 cents en la evaluación, permite generar partituras o piano rolls editables a partir de grabaciones.
- Extracción de melodía vocal: el fine-tune de voz cantada mejora el recall de onset de la melodía principal, adecuado para separar la línea vocal en producciones musicales.
- Análisis musicológico y de interpretación: los mapas de probabilidad y las confianzas por nota permiten estudiar timing, dinámica de ataques y densidad polifónica en grabaciones históricas.
- Generación de datos de entrenamiento para modelos musicales: la transcripción a notas MIDI sirve para construir corpus alineados audio-MIDI a partir de grabaciones existentes.
- Integración en pipelines de producción musical: el paquete `dettato` encadena los cuatro modelos para producir un MIDI con pistas por instrumento y percusión y un JSON con las notas, facilitando la automatización.
- Educación musical: la transcripción automática permite comparar la ejecución de un estudiante con la partitura de referencia mediante las notas detectadas y sus onsets.

## Benchmarks y rendimiento

Resultados F1 x 100 por grabación con mir_eval y tolerancia de 50 cents, promediados por conjunto y luego entre conjuntos. Este transcriptor junto con dettato-drums para la medida de percusión:

| Sistema | Parámetros | Compuesto | Onset | Frame | Offset | Percusión |
|---|---|---|---|---|---|---|
| Dettato + dettato-drums | 15,3M + 5,0M | 59,2 (57,9-60,6) | 67,2 | 77,9 | 44,8 | 47,1 |
| MuScriptor | 1,3B | 45,1 | 48,6 | 70,2 | 27,8 | 34,0 |

En los ocho conjuntos del paper de MuScriptor: 58,4 frente a 44,6 de MuScriptor y 41,1 de YourMT3+.

| Conjunto | Onset | Frame | Offset | Percusión | MuScriptor onset / frame / offset / percusión |
|---|---|---|---|---|---|
| Bach10 | 91,9 | 94,2 | 87,7 | - | 43,1 / 85,0 / 36,0 / - |
| Dagstuhl ChoirSet | 55,9 | 82,0 | 44,4 | - | 14,4 / 80,7 / 11,5 / - |
| PHENICX-Anechoic | 71,2 | 83,3 | 40,0 | - | 56,1 / 74,6 / 32,6 / - |
| RWC Popular | 57,1 | 71,8 | 33,1 | 50,6 | 46,1 / 61,2 / 25,6 / 42,1 |
| RWC Classical | 77,9 | 73,8 | 41,6 | 39,6 | 67,7 / 70,5 / 36,9 / 23,7 |
| RWC Genre | 51,0 | 65,7 | 29,3 | 36,3 | 44,7 / 58,7 / 24,4 / 29,2 |
| RWC Jazz | 63,6 | 67,4 | 36,0 | 36,3 | 59,4 / 62,7 / 33,9 / 31,3 |
| RWC Royalty-Free | 63,3 | 80,2 | 41,3 | 65,4 | 47,1 / 68,6 / 24,8 / 36,5 |
| Slakh2100 test | 73,5 | 82,3 | 49,4 | 54,4 | 58,9 / 70,2 / 24,3 / 41,0 |

Las cifras de MuScriptor y YourMT3+ proceden del paper de Rouard et al. (2026); en Slakh2100, MuScriptor corresponde a una ejecución propia de sus pesos abiertos. Los resultados mostrados son las notas propias de este modelo; el reparador de evidencia se midió por separado.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja por el tamaño (15,3M de parámetros); el repo ocupa 0,1 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con CUDA, incluidas RTX 3060, RTX 4090 o superiores; también funciona en CPU según la API (`Transcriber.from_pretrained("cpu")`).
- Cabe en GPU consumer: sí, sin restricciones prácticas de memoria.
- Opciones de despliegue: paquete Python `dettato` (instalación vía `pip install git+https://github.com/kobimusic/dettato`), API `Transcriber.from_pretrained` con dispositivo `cuda` o `cpu`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Compuesto | Onset | Frame | Offset | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Dettato + dettato-drums | 15,3M + 5,0M | 59,2 | 67,2 | 77,9 | 44,8 | Apache 2.0 | Hugging Face y GitHub |
| MuScriptor | 1,3B | 45,1 | 48,6 | 70,2 | 27,8 | no disponible | pesos abiertos |
| YourMT3+ | no disponible | 41,1 (solo 8 conjuntos) | no disponible | no disponible | no disponible | no disponible | no disponible |

Dettato supera a MuScriptor en el compuesto con aproximadamente 85 veces menos parámetros, y también a YourMT3+ en los ocho conjuntos del paper de MuScriptor (58,4 frente a 41,1).

## Limitaciones y advertencias

- Solo produce notas: no etiqueta instrumentos (lo hace dettato-grouper) ni detecta percusión (lo hace dettato-drums).
- Rango limitado a las 88 teclas del piano (A0-C8); no cubre alturas fuera de ese rango.
- Máximo de dos notas simultáneas por tecla; polifonías más densas en la misma altura no se resuelven.
- El fine-tune de voz cantada está descrito de forma incompleta en la información disponible; conviene verificar su alcance exacto.
- Los umbrales de decodificación son fijos (onset 0,25; segunda voz 0,30; offset 0,30; frame 0,40) y pueden requerir ajuste según el material.
- Riesgo de falsos positivos y negativos en grabaciones con mucha reverberación, ruido o instrumentos con armónicos atípicos; el offset es la medida más débil (44,8 de compuesto).
- No se documentan sesgos demográficos ni lingüísticos al no ser un modelo de texto, pero el rendimiento varía notablemente entre conjuntos (Bach10 91,9 de onset frente a RWC Genre 51,0).
- Licencia Apache 2.0: permite uso comercial con atribución y sin garantías; revisar los términos del paquete y de los modelos de la cadena.
- Al ser un modelo con 0 descargas y 0 likes en el momento de la consulta, la validación por parte de la comunidad es aún inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/kobimusic/dettato
- Repositorio GitHub: https://github.com/kobimusic/dettato
- Colección Dettato: https://huggingface.co/collections/kobimusic/dettato
- Modelo de reparación de evidencia: https://huggingface.co/kobimusic/dettato-evidence
- Modelo de agrupación por instrumento: https://huggingface.co/kobimusic/dettato-grouper
- Modelo de percusión: https://huggingface.co/kobimusic/dettato-drums
- Paper de referencia: Rouard et al. (2026), MuScriptor (referenciado en la model card; sin URL directa en la información disponible)
