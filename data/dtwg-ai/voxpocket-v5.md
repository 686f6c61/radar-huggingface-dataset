# dtwg-ai/VoxPocket-v5

## Resumen

VoxPocket-v5 es un modelo de síntesis de voz (text-to-speech) especializado en jemer (khmer), desarrollado originalmente por Ing Muyleang y redistribuido como espejo por DTWG-AI bajo licencia Apache-2.0. Se construye sobre VoxCPM 1.5 de OpenBMB mediante un ajuste fino adicional sobre el release previo VoxPocket-v4. Con 801,7 millones de parámetros (0,89B), el modelo genera audio a 44,1 kHz y está diseñado para leer jemer con claridad, jemer con palabras en inglés intercaladas (code-mixing) e inglés plano.

La propuesta de valor del modelo es la eficiencia: según la model card, supera en calidad de lectura de jemer a su propio profesor VoxCPM2 (2,38B) en su benchmark de GPU, siendo 2,7 veces más pequeño, un 33% más rápido y consumiendo un 38% menos de energía. Esto lo posiciona como una opción atractiva para despliegues en producción con recursos limitados que necesiten TTS de jemer de calidad.

El modelo incorpora clonación de voz a partir de un clip corto de referencia, control de estilo mediante descripciones entre paréntesis (emociones como enfado, alegría, susurro, tristeza) y diseño de voz sin clip de referencia. Es relevante ahora porque cubre un idioma de bajos recursos (jemer) con un modelo compacto, licencia permisiva y capacidades de personalización que normalmente solo están disponibles en modelos multilingües mucho más grandes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VoxCPM 1.5 (modelo base de OpenBMB), ajustado para TTS; detalles internos de la arquitectura no disponibles |
| Parámetros totales | 801.729.856 (0,89B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; el repo ocupa 13,2 GB) |
| Idiomas soportados | jemer (km), inglés (en); soporta code-mixing jemer-inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Frecuencia de muestreo | 44.100 Hz |
| Librería | voxcpm |
| Pipeline | text-to-speech |
| Modelo base | INGMUYLEANG/VoxPocket-v4 (fine-tune de VoxCPM 1.5) |
| Dataset de entrenamiento | INGMUYLEANG/voxpocket-khmer-tts-v4 |

## Arquitectura y entrenamiento

El modelo parte de VoxCPM 1.5 de OpenBMB, un sistema de TTS que VoxPocket-v4 ya había ajustado para jemer, y sobre el que se realiza una pasada completa adicional de entrenamiento. La información disponible no detalla la arquitectura interna de VoxCPM 1.5 (componentes del encoder de texto, decoder acústico o vocoder), por lo que no se pueden especificar más allá de que se trata de un sistema TTS de extremo a extremo con salida a 44,1 kHz.

El entrenamiento utilizó 778.028 clips que suman aproximadamente 1.010 horas de audio único (la cifra de 1.247 queda truncada en la información disponible). Los datos combinan habla real en jemer y habla destilada de VoxCPM2, e incluyen material nuevo para emociones (susurro, enfado/malestar, alegría, sorpresa, tristeza), textos más largos y palabras en inglés dentro de jemer. El checkpoint principal corresponde al paso 30.000, seleccionado por obtener el mejor error mediano de letras en las pruebas del autor; se distribuyen también los checkpoints de los pasos 35.000, 40.000 y 43.200 (final) en el subdirectorio `checkpoints/`. No se especifica en la información disponible si hubo RLHF o DPO.

## Capacidades

- Síntesis de voz en jemer con salida a 44,1 kHz.
- Lectura de jemer con palabras en inglés intercaladas (code-mixing).
- Lectura de inglés plano.
- Clonación de voz a partir de un clip de referencia limpio de 4 a 9 segundos, junto con la transcripción exacta de lo que se dice en el clip.
- Control de estilo mediante descripciones entre paréntesis antes del texto: susurro, enfado, alegría, sorpresa, tristeza, entusiasmo, calma, tono de locutor de noticias.
- Diseño de voz sin clip de referencia, describiendo la voz en paréntesis (por ejemplo, "mujer joven, voz clara y brillante, tono alegre").
- Generación con streaming (tiempo hasta el primer sonido de 64 ms según el autor).
- Inferencia configurable mediante `cfg_value` e `inference_timesteps` (por ejemplo, cfg 2.0 y 10 pasos en los ejemplos).
- No se menciona soporte de tool calling, agentes ni otras modalidades (visión, audio de entrada) en la información disponible.

## Casos de uso

- **Locución de noticias y contenidos en jemer**: el modelo incluye un estilo "serious and clear news-reader tone" y lee jemer con un error mediano de letras del 3,7-4,3% en frases no vistas, adecuado para generar boletines o artículos narrados a partir de texto.
- **Clonación de voz para audiolibros y pódcast**: con un clip limpio de 4-9 segundos y su transcripción se puede mantener una voz consistente a lo largo de un proyecto; conviene dividir el texto en frases y unir el audio, ya que en párrafos de más de 450 caracteres el modelo comete más errores.
- **Atención al cliente y respuestas de voz automatizadas**: el modelo es compacto (3,8 GB de VRAM en texto corto sobre una RTX 5090) y rápido (3,6× tiempo real), lo que permite generar respuestas habladas en jemer con baja latencia en servidores modestos.
- **Doblaje y localización de contenido con code-mixing**: al soportar jemer con palabras en inglés intercaladas, es útil para vídeos, tutoriales o material educativo donde el vocabulario técnico aparece en inglés dentro de frases en jemer.
- **Accesibilidad y lectura de pantalla**: integración en aplicaciones de lectura de texto a voz para usuarios jemer, con control de estilo para adaptar el tono (calma, entusiasmo) al contexto.
- **Prototipado de asistentes de voz con voz de marca**: el diseño de voz sin clip permite generar muestras con distintas descripciones de voz para elegir una identidad sonora antes de grabar una voz profesional.
- **Generación de audio para formación y e-learning**: creación de narraciones con emociones variadas (susurro, sorpresa, tristeza) para materiales didácticos o simulaciones.

## Benchmarks y rendimiento

Calidad de lectura sobre 40 frases no vistas, con el mismo clip de voz, cfg 2.0, 10 pasos y semilla 0; el error se mide con el reconocedor `seanghay/Qwen3-ASR-0.6B-Khmer` contando errores de letras jemer (menor es mejor):

| 40 frases no vistas | Error mediano | Error medio | Frases con >10% de errores |
|---|---|---|---|
| VoxPocket (este release) | 4,3% | 6,1% | 8/40 |
| VoxPocket (release anterior) | 6,6% | 7,2% | 10/40 |
| VoxCPM2 (2,38B) | 4,8% | 7,0% | 12/40 |

El autor indica que en una segunda máquina el mismo test da 3,7% (paso 30.000) frente a 5,1% del release anterior. Checkpoints alternativos: paso 35.000 y 40.000 con 4,0% de error mediano de letras, y final (43.200) con 4,0%.

Rendimiento en 1× NVIDIA GeForce RTX 5090:

| Métrica | VoxPocket | VoxCPM2 |
|---|---|---|
| Parámetros | 0,89B | 2,38B |
| Velocidad | 3,6× tiempo real | 2,7× |
| Tiempo hasta el primer sonido (streaming) | 64 ms | 77 ms |
| Memoria GPU pico (texto corto / largo) | 3,8 / 6,3 GB | 6,5 / 8,9 GB |
| Potencia GPU hablando | 173 W | 205 W |
| Energía por minuto de habla | 0,80 Wh | 1,29 Wh |
| RAM de CPU | 1,9 GB | 3,1 GB |

En texto largo sin dividir, el release lee bien párrafos cortos (hasta unas 3 frases) y ya no se detiene antes de tiempo, pero en párrafos muy largos (450+ caracteres) comete muchos errores y VoxCPM2 es mejor en ese escenario.

## Requisitos de hardware

- VRAM estimada: 3,8 GB para texto corto y 6,3 GB para texto largo (memoria GPU pico medida en una RTX 5090 con el modelo sin cuantizar).
- RAM de CPU: 1,9 GB.
- GPU recomendadas: el autor reporta mediciones en una NVIDIA GeForce RTX 5090; no se publican datos para A100, H100 o RTX 4090 en la información disponible.
- Cabe en GPU de consumo: sí, según las cifras de memoria pico (3,8-6,3 GB) es viable en tarjetas consumer con al menos 8 GB de VRAM; no se especifican modelos concretos más allá de la RTX 5090.
- Despliegue: mediante la librería `voxcpm` (`VoxCPM.from_pretrained(hf_model_id="dtwg-ai/VoxPocket-v5", load_denoiser=False)`); no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: 3,6× tiempo real y 64 ms hasta el primer sonido en streaming en RTX 5090; 0,80 Wh por minuto de habla.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Calidad (error mediano de letras) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| VoxPocket-v5 | 0,89B | jemer, inglés (code-mixing) | no disponible | 4,3% (3,7% en segunda máquina) | Apache-2.0 | Hugging Face (espejo de muyleanging/VoxPocket-v5) |
| VoxCPM2 | 2,38B | no disponible en la información | no disponible | 4,8% | no disponible en la información | Hugging Face (modelo profesor) |
| VoxPocket-v4 (release anterior) | no disponible | jemer, inglés | no disponible | 6,6% (5,1% en segunda máquina) | Apache-2.0 (según el linaje del proyecto) | Hugging Face |

## Limitaciones y advertencias

- En párrafos muy largos (450+ caracteres) comete numerosos errores y VoxCPM2 rinde mejor; se recomienda dividir el texto en frases y unir el audio.
- El error de lectura no es cero: en el benchmark principal, 8 de 40 frases superan el 10% de errores de letras.
- La clonación de voz requiere un clip limpio de 4-9 segundos y la transcripción exacta de lo que se dice en él; clips ruidosos o mal transcritos degradan el resultado.
- Las palabras duplicadas con el signo `ៗ` deben escribirse desarrolladas (por ejemplo, `ភ្លាមភ្លាម`) o dejar que el paso de texto las expanda.
- Riesgo de uso indebido de la clonación de voz: la licencia Apache-2.0 no impone restricciones de uso, por lo que la responsabilidad ética y legal sobre la suplantación de identidad recae en el desplegador.
- Sesgos conocidos: no se documentan en la información disponible; al entrenarse con habla real y destilada, puede reflejar sesgos de los hablantes del corpus.
- Riesgo de alucinación en TTS: no se documenta explícitamente, pero los errores de lectura medidos indican que puede pronunciar incorrectamente partes del texto.
- Cobertura lingüística limitada a jemer e inglés; no se garantiza calidad en otros idiomas.
- Este repositorio es un espejo sin cambios del original de Ing Muyleang; para citas y soporte debe referenciarse el repositorio original y VoxCPM de OpenBMB.

## Enlaces

- Modelo en Hugging Face (espejo): https://huggingface.co/dtwg-ai/VoxPocket-v5
- Modelo original: https://huggingface.co/muyleanging/VoxPocket-v5
- Autor original en Hugging Face: https://huggingface.co/INGMUYLEANG
- Autor original en GitHub: https://github.com/MuyleangIng
- Modelo base VoxCPM 1.5 (OpenBMB): https://huggingface.co/openbmb/VoxCPM1.5
- Demo en Spaces: https://huggingface.co/spaces/INGMUYLEANG/VoxPocket-v4-demo
- Dataset de entrenamiento: https://huggingface.co/datasets/INGMUYLEANG/voxpocket-khmer-tts-v4
- Modelo base del fine-tune: https://huggingface.co/INGMUYLEANG/VoxPocket-v4
