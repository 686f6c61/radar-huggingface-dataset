# lecturaworld/lectura-diphone-v0

## Resumen

Lectura Diphone v0 es una banco de datos para síntesis de voz por concatenación de difonos en francés, publicado por el proyecto Lectura (Maxime Carrière). No es un modelo neuronal: es un conjunto de parámetros del vocodeur WORLD extraídos de grabaciones del corpus SIWIS (voz fr-f1), empaquetados como pickles comprimidos que consume el paquete Python `lectura-diphone`. El repositorio contiene 1.290 difonos con F0, envolvente espectral en logaritmo (float16, hasta 8 kHz) y aperiodicidad (uint8), muestreados a 44,1 kHz con trama de 5 ms.

Su relevancia es acotada pero clara: ofrece una alternativa de síntesis por reglas y procesamiento de señal, sin inferencia neuronal, con un consumo de recursos mínimo y una licencia permisiva (CC BY 4.0) para los datos. Está pensado para integrarse en el ecosistema Lectura v0, y sirve como referencia para quien necesite TTS en francés con huella computacional muy baja o quiera experimentar con síntesis concatenativa basada en WORLD.

El repositorio tiene 0 GB declarados, no registra descargas ni likes en el momento de la consulta, y no incluye ningún campo de locutor: una única voz, fr-f1, derivada íntegramente del corpus SIWIS.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Síntesis concatenativa por difonos sobre parámetros del vocodeur WORLD (sin red neuronal) |
| Parámetros totales | no disponible (no aplica: no es un modelo neuronal) |
| Parámetros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica: entrada por fonemas) |
| Tipos de cuantización | no aplica; los datos internos usan float16 (envolvente espectral log), uint8 (aperiodicidad) y F0 |
| Idiomas soportados | francés (fr) |
| Licencia | CC BY 4.0 (datos); código `lectura-diphone` bajo AGPL-3.0-or-later o licencia comercial Lectura |
| Formato de pesos | pickles Python comprimidos con gzip (`diphones.dpk.gz`, `diphone_statistics.pkl`) con verificación SHA-256 |

## Arquitectura y entrenamiento

No hay entrenamiento neuronal. La construcción del banco sigue un pipeline de procesamiento de señal: los registros del corpus SIWIS (voz fr-f1) se segmentan en difonos, se analizan con el vocodeur WORLD para extraer F0, envolvente espectral logarítmica y aperiodicidad, y se promedian por difono (hasta 10 ocurrencias) en el dominio log-espectral. El resultado se comprime y se publica junto con estadísticas prosódicas por difono (ratios de duración y F0, pendiente de F0, energía) y duraciones de pausas.

La síntesis se realiza por reglas: el paquete `lectura-diphone` recibe una secuencia de fonemas, selecciona los difonos correspondientes, aplica las estadísticas prosódicas y reconstruye la señal con el vocodeur WORLD. El banco contiene 1.290 difonos a 44,1 kHz con trama de 5 ms. No hay decodificación especulativa, atención lineal ni ningún otro mecanismo neuronal; la innovación, en todo caso, es la ligereza del enfoque y el marcado IPTC `trainedAlgorithmicMedia` que el paquete inserta en los WAV generados.

## Capacidades

- Síntesis de voz en francés a partir de una secuencia de fonemas (entrada fonémica, no texto libre).
- Una única voz: fr-f1, derivada del corpus SIWIS; no hay selección de locutor ni campos de speaker.
- Control prosódico básico mediante estadísticas por difono (duración, F0, energía, pausas).
- Generación de audio WAV a 44,1 kHz con metadatos IPTC de contenido generado por IA.
- Cambio de timbre opcional mediante `lectura-vc-zeroshot` (OpenVoice), que añade marca de agua IA.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta visión, audio de entrada ni modo thinking.
- Multilingüismo: solo francés.

## Casos de uso

- Síntesis de voz embebida de bajo coste: en dispositivos con recursos limitados (Raspberry Pi, sistemas empotrados) donde no cabe un modelo neuronal, el banco de difonos y WORLD permiten generar voz en francés con CPU y poca memoria.
- Generación de avisos y locuciones pregrabadas dinámicas: anuncios de transporte, megafonía o interfaces de voz que requieren frases cortas en francés y no necesitan naturalidad de nivel neuronal.
- Pruebas y prototipado de pipelines TTS: sirve como baseline determinista y reproducible para comparar con modelos neuronales en evaluación de prosodia o inteligibilidad.
- Investigación en síntesis concatenativa: permite estudiar el efecto del promediado de difonos, la cobertura fonética y el modelado prosódico por reglas sobre WORLD.
- Accesibilidad y lectura asistida en francés: lectura de texto convertido previamente a fonemas, con latencia muy baja y sin GPU.
- Integración en el ecosistema Lectura v0: módulo de voz por defecto para aplicaciones que ya usan la plataforma y quieren evitar dependencias de inferencia neuronal.
- Generación de datos de aumento para entrenamiento de sistemas ASR en francés, usando la marca IPTC para trazabilidad del contenido sintético.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica que esta banco no figura en el banco de pruebas v0/v1 de Lectura y que no hay medida cifrada para ella.

## Requisitos de hardware

- VRAM: no aplica; la síntesis corre en CPU, sin GPU.
- GPU recomendadas: ninguna; no requiere aceleración gráfica.
- Cabe en cualquier equipo consumer: el paquete de datos ocupa unos 19 MB comprimidos (`diphones.dpk.gz`) más 191 KB de estadísticas.
- Opciones de despliegue: paquete Python `lectura-diphone` (instalable vía `pip install lectura-diphone`); descarga automática de los ficheros a `~/.lectura/models/tts_diphone/` o a `$LECTURA_MODELS_DIR/tts_diphone/`, con verificación de SHA-256.
- Latencia y throughput: no disponible en la información proporcionada; por la naturaleza del enfoque (procesamiento de señal, sin red neuronal) se espera baja latencia en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Lectura Diphone v0 | Concatenativo (WORLD) | no aplica | no aplica | fr | CC BY 4.0 (datos) / AGPL-3.0-or-later (código) | Hugging Face + PyPI |
| Piper TTS | Neuronal (VITS) | no disponible | no aplica | múltiples | MIT (código) / varias por voz | Hugging Face, GitHub |
| Coqui TTS (XTTS v2) | Neuronal (transformer) | no disponible | no disponible | múltiples | Coqui Public Model License | Hugging Face, GitHub |
| eSpeak NG | Formántico por reglas | no aplica | no aplica | múltiples | GPL-3.0 | GitHub, paquetes del sistema |

La comparación con Piper, XTTS v2 o eSpeak NG es orientativa: los tres son sistemas TTS, pero solo eSpeak NG comparte el enfoque no neuronal. No hay datos de benchmarks que permitan comparar calidad objetiva entre ellos en la información disponible.

## Limitaciones y advertencias

- No es un modelo neuronal: la naturalidad y expresividad están acotadas por la síntesis concatenativa y el promediado de difonos.
- Una sola voz (fr-f1) y un solo idioma (francés); no hay multilingüismo ni selección de locutor.
- Entrada por fonemas, no texto libre: requiere un paso previo de conversión grafema-fonema fuera del alcance del repositorio.
- Los ficheros son pickles Python: cargarlos sin verificar `SHA256SUMS` es un riesgo de seguridad; el paquete oficial verifica la huella antes de instalarlos.
- Licencia de datos CC BY 4.0 con obligación de atribución a SIWIS y a la persona grabada; el código `lectura-diphone` es AGPL-3.0-or-later o licencia comercial Lectura, lo que condiciona el uso en productos propietarios.
- No se deben retirar las marcas de IA (metadatos IPTC `trainedAlgorithmicMedia` y, en su caso, marca de agua de OpenVoice).
- No hay evaluación cuantitativa publicada (MOS, inteligibilidad, WER) para esta banco.
- Riesgo de alucinación no aplica en el sentido habitual; el riesgo es de pronunciación incorrecta por cobertura fonética incompleta o prosodia mal modelada.
- Sesgos: al derivar de un único corpus y una única voz, el timbre y las características acústicas están sesgados hacia esa locutora y ese dominio de grabación.

## Enlaces

- Hugging Face: https://huggingface.co/lecturaworld/lectura-diphone-v0
- Paquete PyPI: https://pypi.org/project/lectura-diphone/
- Documentación Lectura v0: https://www.lectura.world/developpement/modules/v0/
- Contacto Lectura: https://www.lectura.world/contact/
- Corpus SIWIS: https://doi.org/10.7488/ds/1705
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
