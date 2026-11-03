# seslen-tr/seslen-tts

## Resumen

Seslen TTS es un modelo de síntesis de voz (text-to-speech) para turco desarrollado por el proyecto seslen-tr, distribuido en formato ONNX y diseñado para ejecutarse íntegramente en CPU sin depender de PyTorch. Está basado en la arquitectura StyleTTS2, concretamente en una variante "student" destilada a partir de datos generados por VoxCPM2, e incorpora un codificador de texto con PL-BERT adaptado al turco y un vocoder iSTFTNet que produce audio a 24 kHz.

El modelo cubre una necesidad poco atendida en el ecosistema open source: TTS de calidad para turco con control explícito de emoción y con 16 voces predefinidas (adultos, jóvenes, personas mayores, voces infantiles y personajes de dibujos animados). Según su model card, modela correctamente el acento léxico turco y la entonación interrogativa, dos aspectos habitualmente problemáticos en sintetizadores multilingües genéricos.

El repositorio ocupa 0,7 GB y se compone de dos grafos ONNX (78 MB el codificador de texto y 247 MB el decodificador) más ficheros auxiliares de estilos y símbolos. Su licencia CC-BY-SA-4.0 permite uso comercial con atribución y compartir-al-igual, lo que lo hace atractivo para integraciones en producto, aunque con las obligaciones propias de una licencia copyleft.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (student destilado), codificador de texto + PL-BERT turco, decodificador iSTFTNet |
| Parametros totales | no disponible (repo de 0,7 GB; grafos ONNX de 78 MB y 247 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada por frase; sin ventana declarada) |
| Tipos de cuantizacion | no disponible (pesos ya exportados a ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | turco (tr) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX (metin.onnx, ses.onnx) + stiller.npz, sesler.json, semboller.json |

## Arquitectura y entrenamiento

El modelo sigue el esquema StyleTTS2 en su variante de destilación: un codificador de texto con representaciones fonéticas PL-BERT específicas para turco predice duraciones y alineamientos, y un decodificador iSTFTNet genera la forma de onda a 24 kHz a partir de las características alineadas, un vector de estilo de 256 dimensiones y señales de tono y entonación interrogativa. Los estilos se almacenan en un fichero NPZ con 16 voces × 9 emociones, lo que permite condicionar la prosodia sin reentrenar.

Los datos de entrenamiento, según la model card, proceden de audio generado por VoxCPM2 con voces diseñadas (no de personas reales), lo que evita problemas de derechos de imagen y privacidad. No se especifica el número de horas ni la composición exacta del corpus. El modelo se distribuye como "student" destilado, pensado para inferencia ligera en CPU mediante ONNX Runtime, sin pasos de RLHF ni DPO documentados. La innovación principal es la integración del acento léxico turco y la melodía interrogativa dentro del pipeline de síntesis, junto con el empaquetado listo para producción en la librería `seslen-tts`.

## Capacidades

- Síntesis de voz en turco a 24 kHz con 16 voces predefinidas (adultos, jóvenes, mayores, infantiles y personajes animados).
- Control de emoción por voz: 9 vectores de estilo (por ejemplo, neutro, curiosidad, alegría, enfado, advertencia, estilo cuento).
- Modelado del acento léxico turco y de la entonación interrogativa.
- Normalización interna de texto: horas, números y abreviaturas se leen correctamente según la model card.
- Inferencia en CPU con ONNX Runtime, sin necesidad de GPU ni de PyTorch.
- Uso offline: descarga inicial de los cinco ficheros principales y posibilidad de apuntar a una carpeta local mediante `SESLEN_TTS_MODEL` o `Seslen(klasor="...")`.
- API Python sencilla a través del paquete `seslen-tts` (`Seslen().tum(texto, ses="zeynep")`).
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso: es un modelo puramente TTS.

## Casos de uso

- Atención al cliente automatizada en turco: el modelo puede sintetizar respuestas de un asistente conversacional con voces adultas neutras (por ejemplo, Ayşe o Serdar) y cambiar a un tono de advertencia o disculpa según el contexto, sin coste de GPU.
- Audiolibros y cuentacuentos: las voces de narrador mayor (Fatma, Hasan) y el estilo "masal" automático permiten generar narraciones infantiles con entonación adecuada y personajes diferenciados.
- Contenido para niños y edutainment: las voces infantiles (Elif, Can, Ece) y los personajes animados (Pıtırcık, Fırfır, Koca, Kara) cubren diálogos de dibujos animados y aplicaciones educativas.
- Anuncios y avisos en transporte o comercio: la voz de adulto autoritaria pero cercana (Serdar) y la normalización de horas y números facilitan mensajes del tipo "el tren sale a las 14:00" sin preprocesado adicional.
- Accesibilidad y lectura de pantalla en turco: al ejecutarse en CPU y en ONNX Runtime, puede integrarse en aplicaciones de escritorio o móvil ligeras para leer texto en voz alta sin conexión.
- Prototipado de asistentes de voz y demos: el paquete `seslen-tts` con `pip install "seslen-tts[hepsi]"` permite generar WAV en pocas líneas, útil para validar guiones y flujos antes de invertir en un TTS comercial.
- Localización de vídeos y pódcast al turco: la combinación de 16 voces y 9 emociones permite doblar contenido con distintos registros sin contratar actores de voz.

## Benchmarks y rendimiento

La model card publica métricas UTMOS por voz (no hay MMLU, HumanEval ni GSM8K, que no aplican a un modelo TTS):

| Voz | Perfil | UTMOS |
|---|---|---|
| ayse | mujer adulta | 4,01 |
| koca | gigante de dibujos | 3,90 |
| ege | hombre joven, grave | 3,82 |
| hasan | anciano sabio | 3,47 |
| serdar | hombre adulto | 3,46 |
| zeynep | chica joven | 3,41 |
| nehir | mujer joven | 3,08 |
| selin | mujer joven, suave | 3,06 |
| emre | hombre joven, enérgico | 2,91 |
| firfir | zorro astuto | 2,59 |
| fatma | anciana | 2,51 |
| elif | niña (~8 años) | 2,21 |
| ece | niña pequeña | 1,86 |
| kara | bruja malvada | 1,80 |
| pitircik | criatura diminuta | 1,33 |
| can | niño (~9 años) | 1,29 |

El propio autor advierte que UTMOS se entrenó con habla adulta y que las puntuaciones de voces infantiles y de personajes no son comparables con las de voces adultas. No se han publicado resultados de benchmarks comparativos con otros sistemas TTS en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está pensado para CPU con ONNX Runtime.
- Memoria RAM estimada: no disponible de forma explícita; los grafos suman unos 325 MB, por lo que un entorno con 1-2 GB libres debería ser suficiente en la práctica, aunque el dato no está confirmado por el autor.
- GPU recomendadas: no aplica; cualquier CPU moderna es el objetivo. No se documenta aceleración por GPU.
- Cabe en cualquier equipo consumer: portátil, mini-PC o incluso dispositivos de gama baja, al no necesitar CUDA.
- Opciones de despliegue: ONNX Runtime a través del paquete `seslen-tts`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Voces / emociones | Licencia | Ejecución |
|---|---|---|---|---|---|
| Seslen TTS | turco | StyleTTS2 + iSTFTNet (ONNX) | 16 voces × 9 emociones | CC-BY-SA-4.0 | CPU (ONNX Runtime) |
| XTTS-v2 (Coqui) | multilingüe | GPT + VQ-VAE | clonación de voz | Coqui Public Model License | GPU recomendada |
| Piper | multilingüe | VITS | voces por idioma | MIT (por voz) | CPU |
| StyleTTS2 (original) | inglés | StyleTTS2 | estilos por referencia | MIT | GPU recomendada |

La comparación es orientativa: XTTS-v2 y StyleTTS2 original no están especializados en turco ni incluyen el conjunto de emociones y personajes de Seslen, mientras que Piper es más ligero pero no ofrece control emocional explícito. No se dispone de métricas cruzadas entre estos sistemas en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta turco; no hay capacidades multilingües declaradas.
- Las voces son sintéticas y diseñadas, no de personas reales; aun así, podría haber similitudes accidentales con voces existentes.
- UTMOS bajo en voces infantiles y de personajes (1,29-2,21), lo que sugiere menor naturalidad en esos registros.
- Riesgo de alucinación prosódica o de pronunciación incorrecta en palabras poco frecuentes, siglas o nombres propios no cubiertos por la normalización.
- La licencia CC-BY-SA-4.0 es copyleft: el uso comercial exige atribución y compartir-al-igual de las obras derivadas, lo que puede condicionar su integración en productos propietarios.
- No se documentan límites de longitud de entrada; el uso está pensado por frase, por lo que textos largos requieren segmentación previa.
- Sin datos publicados sobre latencia, throughput ni consumo de memoria en producción.
- El proyecto tiene 0 descargas y 0 likes en el momento de la consulta, por lo que su madurez y soporte comunitario son limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/seslen-tr/seslen-tts
- Repositorio del paquete Python: https://github.com/seslen-tr/seslen-tts
- Ejemplos de audio: https://huggingface.co/seslen-tr/seslen-tts/tree/main/ornekler
