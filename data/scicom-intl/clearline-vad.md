# Scicom-intl/Clearline-VAD

## Resumen

Clearline-VAD es un detector de actividad de voz (VAD) en streaming publicado por Scicom-intl (Scicom MSC Bhd) como sustituto directo de `silero.VAD` en LiveKit Agents. El modelo tiene 55 000 parámetros, se distribuye como grafo ONNX y se ejecuta exclusivamente en CPU: recibe audio a 16 kHz y emite una probabilidad de voz cada 16 ms, tanto en banda ancha como en audio telefónico.

El problema que aborda es el coste de CPU y la latencia del VAD dentro de agentes de voz en tiempo real. Según la model card, el modelo consume 61 µs por trama de 32 ms en un núcleo, frente a los 101 µs de Silero v6, y baja el consumo del plugin por stream a 0,47 % de un núcleo (16 kHz, 8 streams) frente a 1,19 %. En detección de turnos con la máquina de estados de LiveKit reporta 0,857 de turnos detectados con un onset mediano de 239 ms, frente a 0,801 / 247 ms de Silero v6.

Es relevante para pipelines de telefonía y voz conversacional porque incluye una variante destilada con el mismo grafo y coste de CPU, y porque la evaluación cubre 40 idiomas de FLEURS con ruido DEMAND y escenas urbanas TUT, de 30 a −5 dB de SNR y a través de una ruta telefónica con cinco códecs. El repo es de octubre de 2026, con 0 descargas, 0 likes y licencia no disponible, lo que supone una adopción y un marco legal todavía sin verificar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (grafo ONNX de streaming para detección de voz; el autor no documenta la topología interna) |
| Parámetros totales | 55 000 (55k) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; procesamiento en streaming con tramas de 16 ms |
| Tipos de cuantización | No disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | Multilingüe; 40 idiomas evaluados con FLEURS (alemán, inglés, francés, español, neerlandés, hausa, italiano, mandarín, malayo, portugués, suajili, polaco, yoruba, bengalí, georgiano, japonés, tailandés, tamil, cantonés, ruso, coreano, ucraniano, javanés, telugu, birmano, turco, jemer, urdu, mongol, persa, árabe, griego, hebreo, indonesio, hindi, amárico, vietnamita, lao, zulú y filipino) |
| Licencia | No disponible |
| Formato de pesos | ONNX |
| Frecuencia de muestreo | 16 kHz |
| Resolución temporal | 1 probabilidad cada 16 ms |
| Variantes | Clearline-VAD y Clearline-VAD destilado (mismo grafo y mismo coste de CPU) |

## Arquitectura y entrenamiento

No se detalla la topología interna de la red: la información disponible solo indica que es un modelo de 55 000 parámetros exportado a ONNX, pensado para inferencia en CPU en modo streaming, con una decisión cada 16 ms sobre audio de 16 kHz. No hay datos sobre número de capas, tipo de atención ni mecanismo de agregación temporal.

Sí se documenta el corpus de entrenamiento en términos de horas simuladas por idioma: alemán 421 h, inglés 404 h, francés 214 h, español 200 h, neerlandés 91 h, hausa 88 h, italiano 71 h, mandarín 54 h, malayo 49 h, portugués 40 h, suajili 32 h, polaco 29 h, yoruba 27 h, bengalí 27 h, georgiano 21 h, japonés 21 h, tailandés 14 h, tamil 8 h, cantonés 7 h, ruso 7 h, coreano 6 h, ucraniano 4 h, javanés 4 h, telugu 4 h, birmano 4 h, turco 4 h, jemer 3 h, urdu 3 h, mongol 3 h, persa 2 h, árabe 2 h, griego 1 h, y el resto (hebreo, indonesio, hindi, amárico, vietnamita, lao, zulú, filipino) por debajo de 1 h. El pool se aumenta con ruido de dos familias: DEMAND (hogares, oficinas, lugares públicos, transporte) y escenas urbanas TUT (aeropuertos, metro, calles, centros comerciales), con SNR de 30 a −5 dB y una ruta telefónica simulada con cinco códecs.

La variante destilada mantiene el mismo grafo y coste de CPU, y mejora la ROC-AUC media (0,923 frente a 0,921) y los falsos disparos por hora sin sets telefónicos privados (18,9 frente a 27,5), a costa de un onset mediano más tardío en LiveKit (296 ms frente a 239 ms). La evaluación de turnos se hizo replicando cada turno con la máquina de estados propia de LiveKit sobre 10 conjuntos de test, con el umbral elegido en cuatro conjuntos de desarrollo (AMI dev y VoxConverse dev, banda ancha y teléfono); Silero v6 se evalúa en su mejor punto sobre esos mismos cuatro conjuntos (umbral 0,70). No se menciona RLHF ni DPO, algo esperable en un modelo discriminativo de este tamaño.

## Capacidades

- Detección de actividad de voz a nivel de trama, con salida de probabilidad cada 16 ms.
- Funcionamiento en streaming con estado, adecuado para audio continuo sin ventanas solapadas de gran tamaño.
- Sustituto directo de `silero.VAD` en LiveKit Agents, con el mismo contrato de plugin.
- Audio de banda ancha (16 kHz) y audio telefónico, incluida la ruta a través de cinco códecs.
- Multilingüe: evaluación en 40 idiomas, con cobertura desigual según las horas de entrenamiento.
- Inferencia solo en CPU, sin requisito de GPU ni de aceleradores.
- Variante destilada orientada a reducir falsos disparos manteniendo el coste de CPU.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades de agente por sí mismo: es un componente acústico dentro de un pipeline mayor.
- No dispone de visión, audio multimodal ni modo de razonamiento.

## Casos de uso

- **Detección de turno en agentes de voz sobre LiveKit**: el modelo se instala como plugin VAD y alimenta la máquina de estados de turnos; con 0,857 de turnos detectados y 239 ms de onset mediano, es adecuado para asistentes conversacionales de baja latencia sin consumir GPU.
- **Atención al cliente telefónica**: al estar entrenado con ruta telefónica y cinco códecs, puede segmentar llamadas de 8 kHz y marcar inicio y fin de habla antes de enviar el audio a un ASR, reduciendo el coste de transcripción al no procesar silencio.
- **Barge-in en asistentes de voz**: la resolución de 16 ms permite detectar que el usuario empieza a hablar mientras el sistema responde y cortar la síntesis; los 61 µs por trama dejan margen para ejecutarlo en el mismo núcleo que el resto del agente.
- **Pre-segmentación para transcripción con Whisper u otros ASR**: usar el VAD como filtro previo para cortar audio en segmentos con voz, con la ventaja de que el modelo ocupa 55 000 parámetros y puede convivir con el ASR en la misma máquina.
- **Despliegue en edge o dispositivos sin GPU**: al ejecutarse en ONNX Runtime sobre CPU, cabe en pasarelas telefónicas, Raspberry Pi o contenedores pequeños; 8 streams a 16 kHz consumen 0,47 % de un núcleo.
- **Grabación y actas de reuniones**: la evaluación sobre AMI dev en telefonía (0,947 de onsets, 0,857 de finales) lo hace utilizable para trocear reuniones y descartar silencios antes de la diarización.
- **Ahorro de ancho de banda en transmisión de voz**: al clasificar voz frente a ruido en tiempo real, puede actuar como puerta que detiene el envío de paquetes en silencio en aplicaciones de voz sobre IP.
- **Limpieza de corpus de audio**: filtrar horas de grabaciones multilingües para quedarse solo con fragmentos con habla, con la advertencia de que el rendimiento cae en idiomas con menos de una hora de entrenamiento.

## Benchmarks y rendimiento

Comparativa principal publicada en la model card (LiveKit reproduce cada turno con su propia máquina de estados; umbrales elegidos en cuatro conjuntos de desarrollo):

| Métrica | Silero v6 | Clearline-VAD | Clearline-VAD destilado |
|---|---|---|---|
| CPU por trama de 32 ms, un núcleo | 101 µs | 61 µs | mismo grafo |
| CPU del plugin por stream, 16 kHz, 8 streams (% de un núcleo) | 1,19 % | 0,47 % | mismo grafo |
| CPU del plugin por stream, 48 kHz, 8 streams (% de un núcleo) | 1,57 % | 1,03 % | mismo grafo |
| ROC-AUC media por trama, 13 conjuntos de test | 0,912 | 0,921 (mejor en 8) | 0,923 (mejor en 9) |
| LiveKit: turnos detectados / onset mediano | 0,801 / 247 ms | 0,857 / 239 ms | 0,841 / 296 ms |
| LiveKit: finales de turno a tiempo | 0,718 | 0,775 | 0,733 |
| LiveKit: falsos disparos por hora, 10 conjuntos | 29,6 | 38,0 | 29,2 |
| LiveKit: falsos disparos por hora, sin los conjuntos telefónicos privados | 28,1 | 27,5 | 18,9 |
| Teléfono: ROC-AUC por trama, FLEURS a través de 5 códecs | 0,936 | 0,923 | 0,933 |
| Teléfono: ROC-AUC por trama, conjuntos de desarrollo | 0,963 | 0,960 | 0,964 |
| Teléfono: LiveKit en AMI dev (onsets / finales / falsos por hora) | 0,877 / 0,750 / 17,4 | 0,947 / 0,857 / 32,4 | 0,914 / 0,772 / 28,1 |

Resultados agregados en FLEURS (40 idiomas, condiciones agrupadas):

| Condición de ruido | Silero v6 | Clearline-VAD | Clearline-VAD destilado |
|---|---|---|---|
| DEMAND, 40 idiomas agrupados | 0,926 | 0,920 | 0,926 |
| TUT, 40 idiomas agrupados | 0,940 | 0,941 | 0,944 |

Número de idiomas (de 40) en los que Clearline supera a Silero v6, por condición de SNR:

| Variante | Ruido | 30 dB | 10 dB | 5 dB | 0 dB | −5 dB | Teléfono | Agrupado |
|---|---|---|---|---|---|---|---|---|
| Clearline-VAD | DEMAND | 33 | 15 | 14 | 11 | 13 | 10 | 12 |
| Clearline-VAD | TUT | 35 | 21 | 16 | 18 | 24 | 15 | 21 |
| Destilado | DEMAND | 34 | 21 | 17 | 9 | 11 | 19 | 19 |

La tabla de la variante destilada en TUT aparece truncada en la información disponible, por lo que no se reproduce. Ejemplos por idioma con diferencias notables: en inglés gana Silero (DEMAND 0,943 frente a 0,932; TUT 0,951 frente a 0,939); en alemán gana Clearline (DEMAND 0,974 frente a 0,961; TUT 0,979 frente a 0,960); en filipino, con 0 h de entrenamiento, Clearline cae a 0,695 en DEMAND frente a 0,734 de Silero.

## Requisitos de hardware

- VRAM: no aplica; el modelo no usa GPU. El repositorio ocupa 0,0 GB según HuggingFace (cifra redondeada) y el modelo declara 55 000 parámetros.
- GPU recomendadas: ninguna. Cualquier CPU x86-64 o ARM con ONNX Runtime es suficiente; no se han publicado cifras para CUDA, ROCm ni Metal.
- Cabe en cualquier GPU consumer, pero no la necesita; también cabe en dispositivos embebidos y en el mismo proceso que el agente de voz.
- Coste medido: 61 µs por trama de 32 ms en un núcleo, aproximadamente 525 veces más rápido que tiempo real por núcleo en esa métrica.
- Throughput del plugin: 8 streams a 16 kHz consumen 0,47 % de un núcleo; 8 streams a 48 kHz, 1,03 %.
- Opciones de despliegue: ONNX Runtime con CPUExecutionProvider, el plugin de LiveKit Agents como sustituto de `silero.VAD`, o integración directa en servicios propios en Python/C++. vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo generativo.
- Latencia: la decisión del modelo llega cada 16 ms; el onset mediano de 239 ms medido en LiveKit incluye la lógica de turnos y el umbral, no solo la inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | CPU por 32 ms (1 núcleo) | ROC-AUC media (13 sets) | Turnos detectados (LiveKit) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Clearline-VAD | 55 000 | 61 µs | 0,921 | 0,857 | No disponible | HuggingFace, ONNX |
| Clearline-VAD destilado | 55 000 (mismo grafo) | 61 µs | 0,923 | 0,841 | No disponible | HuggingFace, ONNX |
| Silero v6 | No disponible en la información consultada | 101 µs | 0,912 | 0,801 | No disponible en la información consultada | Referencia habitual en LiveKit Agents |
| WebRTC VAD | No disponible | No disponible | No disponible | No disponible | No disponible | No evaluado en esta model card |
| TEN-VAD | No disponible | No disponible | No disponible | No disponible | No disponible | No evaluado en esta model card |

La model card solo compara contra Silero v6; no hay datos de otros VAD en la información proporcionada.

## Limitaciones y advertencias

- **Licencia no disponible**: sin términos publicados no se puede asumir uso comercial; conviene contactar con el autor antes de integrarlo en producción.
- **Madurez y validación externa**: 0 descargas, 0 likes, repositorio creado en octubre de 2026 y actualizado un día después; no hay evaluaciones independientes que confirmen las cifras del autor.
- **Resultados peores que Silero en varios idiomas**: inglés (DEMAND 0,932 frente a 0,943), coreano, vietnamita, indonesio, javanés, filipino, persa, malayo, telugu, entre otros; la ventaja depende del idioma y de la condición de ruido.
- **Más falsos positivos en el agregado de 10 conjuntos**: 38,0 por hora frente a 29,6 de Silero; la ventaja solo aparece al excluir los conjuntos telefónicos privados (27,5 frente a 28,1) o al usar la variante destilada (18,9).
- **Peor comportamiento telefónico en FLEURS con códecs**: 0,923 frente a 0,936 de Silero, aunque la diferencia se invierte en los conjuntos de desarrollo (0,960 frente a 0,963).
- **Idiomas con pocos datos**: por debajo de una hora de entrenamiento el rendimiento cae de forma clara (filipino 0,695 en DEMAND, frente a 0,972 en TUT); no se debe asumir cobertura uniforme en los 40 idiomas.
- **Sesgos**: no se documenta ninguna evaluación de sesgos por acento, edad, género o tipo de micrófono; el entrenamiento es sintético y basado en un pool simulado, lo que puede no reflejar dominios reales.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos (marcar ruido como voz) y falsos negativos (perder habla en SNR muy baja), con impacto directo en la facturación de minutos o en el corte de turnos.
- **Dependencia de umbral**: todas las métricas de LiveKit dependen del punto de operación elegido en cuatro conjuntos de desarrollo; el umbral óptimo en producción puede diferir.
- **Alcance limitado**: es un componente acústico, no un modelo de lenguaje; no resuelve semántica, solapamientos de hablantes ni diarización.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Scicom-intl/Clearline-VAD
- Otro modelo del mismo autor (VAD semántico con Whisper): https://huggingface.co/Scicom-intl/semantic-vad-eot-whisper-small
- Ficha del autor en SAVRN: https://savrn.com/model-publishers/scicom-intl
- Registro de un modelo relacionado en free2aitools: https://free2aitools.com/model/scicom-intl/semantic-vad-eot-whisper-base
- Clearline AI (sitio encontrado en la búsqueda; por el contenido parece una empresa de análisis de líneas eléctricas y no está confirmado que corresponda a este autor): https://www.clearlineai.com/
