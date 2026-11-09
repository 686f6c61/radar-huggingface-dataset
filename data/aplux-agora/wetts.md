# APLUX-Agora/WeTTS

## Resumen

WeTTS es un modelo de síntesis de voz (text-to-speech) publicado por APLUX-Agora en Hugging Face, orientado a la conversión de texto en chino a audio mediante un frontend completo de polifonía y prosodia junto con un modelo acústico VITS. El repositorio no distribuye los pesos originales en formato estándar (safetensors o PyTorch), sino recursos ya convertidos y empaquetados para su despliegue en placas con SoC de Qualcomm, organizados por directorio `targets/<SoC>/` y con binarios de contexto en formato ONNX/QNN.

La relevancia del modelo es fundamentalmente de despliegue en el borde (AIoT): la model card reporta mediciones reales sobre hardware Qualcomm, con un RTF de 0,060 en QCS8550 (Rhino Pi X1) y de 0,101 en QCS6490 (Rhino Pi A1), ambos en precisión FP32. Es decir, el modelo sintetiza audio más rápido que tiempo real en placas embebidas de gama media-alta, lo que lo sitúa como candidato para asistentes de voz locales sin dependencia de la nube.

No se dispone de información sobre el número de parámetros, la longitud de contexto textual, los idiomas soportados más allá del chino ni los datos de entrenamiento. La licencia es propietaria (APLUX Model Farm License) y el modelo original subyacente mantiene sus propios términos, lo que condiciona fuertemente su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (modelo acústico) con frontend de polifonía y prosodia; empaquetado para inferencia en ONNX/QNN |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP32 (precisión por defecto reportada); otras precisiones empaquetadas por SoC no detalladas |
| Idiomas soportados | chino (síntesis); resto no disponible |
| Licencia | APLUX Model Farm License (propietaria); modelo fuente sujeto a sus propios términos |
| Formato de pesos | binarios de contexto `model.bin` por precisión y SoC, con `model.json` de configuración; tags ONNX y QNN |

## Arquitectura y entrenamiento

El modelo sigue la familia VITS, un esquema de síntesis de extremo a extremo que combina un codificador de texto, un predictor de duración y un decodificador generativo con discriminador adversarial en entrenamiento, apoyado aquí por un frontend que resuelve polifonía (lectura correcta de caracteres con múltiples pronunciaciones) y prosodia. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo ajuste por RLHF o preferencias; esos datos no están disponibles.

La innovación relevante no está en el algoritmo sino en el pipeline de despliegue: APLUX Model Farm convierte el modelo a recursos ejecutables por SoC, con binarios de contexto y un runner que incluye preprocesado y postprocesado. El repositorio separa explícitamente los artefactos por `targets/QCS8550` y `targets/QCS6490`, cada uno con su `model.json` indicando precisión por defecto y rutas de variantes, lo que permite reproducir el mismo modelo en distintas placas sin recompilar el grafo.

## Capacidades

- Síntesis de voz a partir de texto en chino, con salida de audio.
- Resolución de polifonía: el frontend desambigua caracteres chinos con varias lecturas según contexto.
- Modelado de prosodia: el frontend marca pausas y patrones entonativos antes del modelo acústico.
- Inferencia en el dispositivo sobre aceleradores Qualcomm (QNN) y en formato ONNX.
- Ejecución por lotes o en flujo continuo mediante el runner incluido en el paquete de despliegue.
- Soporte de tool calling, agentes, razonamiento multi-paso, visión o audio de entrada: no disponible (no son capacidades de este modelo).
- Capacidades multilingües: no disponibles; la model card solo menciona chino.

## Casos de uso

- Asistentes de voz embebidos en placas Qualcomm: con RTF de 0,060 en QCS8550, el modelo genera un segundo de audio en unos 60 ms de cómputo, lo que permite respuestas habladas fluidas en dispositivos sin conexión.
- Lectura de notificaciones y mensajes en dispositivos AIoT: el frontend de polifonía y prosodia evita errores de pronunciación en textos cortos generados dinámicamente, un escenario habitual en wearables y paneles industriales.
- Interfaces de accesibilidad para personas con discapacidad visual: síntesis local de contenido de pantalla en chino, sin enviar texto a servicios externos, lo que reduce latencia y exposición de datos.
- Kioscos y terminales de información pública: el RTF de 0,101 en QCS6490 permite operar en hardware de coste contenido manteniendo respuesta en tiempo real para anuncios y guiado.
- Automatización industrial con avisos hablados: integración en líneas de producción donde se anuncian estados de máquina o alarmas, con el modelo ejecutándose en la propia placa controladora.
- Prototipado de productos de voz sin placa: la demo online en mega.aidlux.com permite evaluar la calidad de síntesis antes de adquirir hardware, útil para validar requisitos acústicos y de prosodia.
- Pruebas de regresión de audio en CI: al estar empaquetado por SoC y precisión, se puede fijar una variante concreta y comparar la salida ante cambios de texto para detectar regresiones de pronunciación.

## Benchmarks y rendimiento

| SoC · placa | Precisión | RTF medido en Agora |
|---|---|---|
| QCS8550 · Rhino Pi X1 | FP32 | 0,060 |
| QCS6490 · Rhino Pi A1 | FP32 | 0,101 |

No se han publicado resultados de benchmarks de calidad de síntesis (MOS, WER de ASR sobre audio generado, similitud de hablante) en la información disponible. Los únicos datos objetivos son los RTF anteriores, medidos por el autor sobre hardware real.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo está orientado a SoC Qualcomm con memoria unificada, no a GPU discreta.
- GPU recomendadas: no aplica para el paquete publicado; el despliegue objetivo son QCS8550 y QCS6490.
- Compatibilidad con GPU de consumo: no disponible; no se documenta ejecución en RTX 4090, A100 o H100.
- Opciones de despliegue: runner de Agora con binarios de contexto QNN/ONNX; descarga mediante `hf download` filtrando por `targets/<SoC>/*`.
- Latencia y throughput: RTF 0,060 (QCS8550) y 0,101 (QCS6490) en FP32, lo que equivale a aproximadamente 16,7x y 9,9x tiempo real respectivamente.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Despliegue en borde | RTF publicado |
|---|---|---|---|---|---|
| WeTTS (APLUX-Agora) | VITS + frontend chino | chino | APLUX Model Farm (propietaria) | QNN/ONNX en QCS8550 y QCS6490 | 0,060 / 0,101 |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada; no se han incluido cifras de terceros para evitar datos no verificados.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se documenta la composición del corpus de entrenamiento ni la diversidad de voces.
- Riesgo de alucinación: en TTS se traduce en pronunciaciones erróneas o prosodia incorrecta ante texto fuera de dominio, siglas o neologismos; el frontend de polifonía mitiga pero no elimina este riesgo.
- Limitaciones de idioma: la model card solo declara síntesis en chino; no hay evidencia de soporte para castellano ni otras lenguas.
- Restricciones de licencia: la licencia APLUX Model Farm es propietaria y el modelo fuente mantiene sus propios términos; es imprescindible revisar `LICENSE_MODEL_FARM.pdf` y `NOTICE.md` antes de cualquier uso comercial o redistribución.
- Falta de transparencia técnica: no se publican parámetros, contexto, dataset ni métricas de calidad, lo que dificulta la evaluación rigurosa frente a alternativas.
- Dependencia de hardware: los artefactos están empaquetados por SoC; ejecutarlos fuera de QCS8550 o QCS6490 requiere trabajo adicional no documentado.
- Verificación de integridad: el repositorio incluye `SHA256SUMS`; conviene comprobar los binarios antes de desplegarlos en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APLUX-Agora/WeTTS
- Demo online: https://mega.aidlux.com/models/wetts
- Plataforma Agora: https://mega.aidlux.com
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/WeTTS/blob/main/LICENSE_MODEL_FARM.pdf
