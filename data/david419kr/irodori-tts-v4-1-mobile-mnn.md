# david419kr/Irodori-TTS-v4.1-Mobile-MNN

## Resumen

Irodori-TTS-v4.1-Mobile-MNN es una conversión de los checkpoints oficiales de Aratako (Irodori-TTS-v4.1-Small y Irodori-TTS-v4.1-Small-MF) al runtime MNN para su uso en Android. El modelo realiza síntesis de voz (text-to-speech) en japonés y genera audio PCM mono a 48 kHz. Lo publica el usuario david419kr y no es un entrenamiento nuevo, sino un empaquetado orientado a inferencia en dispositivos móviles.

La aportación principal es la cuantización de los pesos del DiT (Diffusion Transformer) en W8 y W4 simétricos, manteniendo el decodificador del códec en W8 sobre CPU, el encoder de referencia sin cuantizar y los encoders de condición en FP32 ONNX. Se ofrecen cuatro variantes: Small y Small-MF, cada una con pesos DiT W8 y W4. Small emplea muestreo RF Euler con CFG independiente (40 pasos por defecto); Small-MF emplea MeanFlow sin CFG en tiempo de ejecución (4 pasos por defecto).

Es relevante para quien necesite TTS japonés offline en Android sin depender de servidores ni GPUs de centro de datos. El repositorio ocupa 2,9 GB y contiene únicamente datos de modelo, sin muestras de voz personales, textos de libros, cuentas ni credenciales. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) para TTS sobre códec semántico DACVAE; variante Small con muestreo RF Euler y CFG, variante Small-MF con MeanFlow |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica como ventana de contexto de LLM |
| Tipos de cuantización | W8 y W4 simétricos en pesos DiT; decodificador del códec W8 en CPU; encoder de referencia sin cuantizar; encoders de condición FP32 ONNX |
| Idiomas soportados | japonés (ja) |
| Licencia | MIT para este repositorio; las condiciones de los modelos upstream no están disponibles en la información proporcionada |
| Formato de pesos | MNN para Android; ONNX para encoders de condición; salida PCM mono 48 kHz |
| Variantes incluidas | Small W8, Small W4, Small-MF W8, Small-MF W4 |
| Pasos de muestreo por defecto | 40 en Small; 4 en Small-MF |
| CFG | Small: texto 3, caption 3, speaker 5 para t >= 0,5; Small-MF: sin CFG en tiempo de ejecución |
| Tamaño del repositorio | 2,9 GB |
| Modelos base | Aratako/Irodori-TTS-v4.1-Small y Aratako/Irodori-TTS-v4.1-Small-MF |
| Códec | Aratako/Semantic-DACVAE-Japanese-32dim |

## Arquitectura y entrenamiento

La arquitectura es un Diffusion Transformer (DiT) que genera representaciones de audio condicionadas por texto, caption y hablante, y que se apoya en el códec semántico Semantic-DACVAE-Japanese-32dim para reconstruir la forma de onda. La variante Small utiliza muestreo RF Euler con classifier-free guidance independiente por condición (texto, caption y speaker), con 40 pasos por defecto. La variante Small-MF utiliza MeanFlow y elimina el CFG en tiempo de ejecución, lo que reduce el número de pasos por defecto a 4 y disminuye el coste computacional en el dispositivo.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. Este repositorio no entrena el modelo: convierte los checkpoints oficiales a MNN y aplica cuantización simétrica W8/W4 a los pesos del DiT. La innovación técnica destacable es ese empaquetado para Android, con el decodificador del códec en W8 sobre CPU, los encoders de condición en FP32 ONNX y el encoder de referencia sin cuantizar. Los bits de peso indican el almacenamiento del DiT, no aritmética entera en todo el pipeline.

## Capacidades

- Síntesis de voz en japonés con salida PCM mono a 48 kHz.
- Condicionamiento por texto, caption y hablante, con escalas CFG independientes en la variante Small.
- Conservación de los grupos de voz originales del modelo upstream.
- Dos modos de generación: RF Euler con 40 pasos (Small) y MeanFlow con 4 pasos (Small-MF).
- Ejecución offline en Android mediante el runtime MNN.
- Cuatro combinaciones de variante y cuantización (Small/Small-MF en W8/W4) para ajustar tamaño y calidad.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, audio de entrada, tool calling ni comportamiento de agente.
- No se documentan capacidades multilingües distintas del japonés.

## Casos de uso

- Lectura en voz alta y accesibilidad en aplicaciones Android: el motor MNN permite integrar la síntesis en la app y generar audio 48 kHz sin conexión, útil para usuarios con discapacidad visual o para escuchar contenidos en japonés.
- Asistentes de voz y altavoces inteligentes en japonés: la variante Small-MF, con 4 pasos y sin CFG en tiempo de ejecución, reduce el coste por frase y encaja en respuestas conversacionales de baja latencia.
- Audiolibros y contenido narrado: la condicionalización por hablante y caption permite mantener una voz consistente y ajustar el estilo; la generación puede hacerse por lotes en un servidor o en el propio dispositivo.
- Aprendizaje de japonés: la salida PCM mono a 48 kHz sirve para practicar pronunciación y comprensión auditiva, con voces conservadas del modelo upstream.
- Videojuegos y NPCs: los grupos de voz preservados y la inferencia local permiten generar diálogos variables sin enviar texto a un servicio externo.
- Sistemas de megafonía, IVR y avisos pregrabados: se puede pregenerar audio en japonés y distribuirlo como PCM, evitando inferencia en tiempo real en el equipo de reproducción.
- Prototipado de doblaje y animación: la combinación de caption y speaker facilita pruebas de distintas voces y estilos antes de una producción final.
- Investigación en TTS eficiente: la comparación directa entre RF Euler con 40 pasos y MeanFlow con 4 pasos, ambos en W8/W4, permite medir el compromiso entre calidad y coste en hardware móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que la validación funcional y de escucha está documentada por el proyecto de la aplicación, pero no se incluyen métricas objetivas como MOS, WER, RTF ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El destino documentado es Android mediante MNN, no GPU de centro de datos.
- GPU recomendadas: no disponible. No se documenta soporte para A100, H100 ni RTX 4090.
- ¿Cabe en GPU de consumo? No hay datos. El modelo está pensado para SoC ARM móviles, no para CUDA.
- Repositorio de 2,9 GB con cuatro variantes; el tamaño por variante no está disponible.
- El decodificador del códec se ejecuta en W8 sobre CPU; los encoders de condición son FP32 ONNX y el encoder de referencia no está cuantizado, por lo que el pipeline completo no es aritmética entera de principio a fin.
- Despliegue: runtime MNN en Android. No se documentan vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un modelo de difusión de TTS.
- Latencia y throughput: no disponibles. Como referencia de coste, Small usa 40 pasos y Small-MF usa 4 pasos por defecto, lo que reduce el número de evaluaciones del DiT en la variante MeanFlow.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Irodori-TTS-v4.1-Mobile-MNN Small W8/W4 | no disponible | no aplica | RF Euler, 40 pasos, CFG | MIT (repo) | HuggingFace, MNN Android |
| Irodori-TTS-v4.1-Mobile-MNN Small-MF W8/W4 | no disponible | no aplica | MeanFlow, 4 pasos, sin CFG | MIT (repo) | HuggingFace, MNN Android |
| Aratako/Irodori-TTS-v4.1-Small (upstream) | no disponible | no aplica | RF Euler con CFG | no disponible en la información | HuggingFace |
| Aratako/Irodori-TTS-v4.1-Small-MF (upstream) | no disponible | no aplica | MeanFlow sin CFG | no disponible en la información | HuggingFace |

No se han encontrado en la información disponible otros modelos de TTS japonés comparables con datos verificables de parámetros, contexto o rendimiento. La comparación directa más fiable es entre las dos variantes de este repositorio y sus checkpoints upstream.

## Limitaciones y advertencias

- Solo soporta japonés (ja); no se documentan otros idiomas.
- No es un modelo de lenguaje: no genera texto, no razona, no hace tool calling ni actúa como agente.
- No hay benchmarks públicos ni métricas de calidad; el repositorio tiene 0 descargas y 0 likes, por lo que la validación comunitaria es inexistente.
- Es una conversión y cuantización de checkpoints ajenos; la calidad final está acotada por el modelo upstream y puede degradarse con W4.
- No se dispone de información sobre el dataset de entrenamiento, los sesgos presentes ni la representación de acentos o registros del japonés.
- La licencia del repositorio es MIT, pero la model card remite a las condiciones de los modelos upstream; es necesario verificar esos términos antes de un uso comercial.
- La condicionalización por hablante y la preservación de grupos de voz permiten generar voces similares a las de referencia; existe riesgo de suplantación y de deepfakes de voz. Se requiere consentimiento y cumplimiento normativo.
- El repositorio declara no contener muestras de voz personales, textos de libros, cuentas ni credenciales, pero eso no elimina el riesgo de uso indebido del modelo.
- El pipeline no es aritmética entera completa: el encoder de referencia no está cuantizado y los encoders de condición son FP32 ONNX, lo que afecta al tamaño y a los requisitos de memoria.
- No se documenta soporte para GPUs, servidores de inferencia convencionales ni otros runtimes distintos de MNN en Android.
- Las fechas de creación y actualización del repositorio son de 2026; su juventud no implica madurez ni soporte a largo plazo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/david419kr/Irodori-TTS-v4.1-Mobile-MNN
- Modelo upstream Small: https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small
- Modelo upstream Small-MF: https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small-MF
- Códec: https://huggingface.co/Aratako/Semantic-DACVAE-Japanese-32dim

No se han encontrado papers, blogs, repositorios de código ni demos adicionales relevantes en la búsqueda web realizada.
