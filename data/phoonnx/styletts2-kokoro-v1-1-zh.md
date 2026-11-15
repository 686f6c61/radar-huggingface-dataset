# Phoonnx/styletts2-kokoro-v1.1-zh

## Resumen

`Phoonnx/styletts2-kokoro-v1.1-zh` es un paquete de pesos en formato ONNX del modelo de síntesis de voz StyleTTS2, extraído del repositorio agregador `Phoonnx/phoonnx-styletts2` y empaquetado para su uso con la librería `phoonnx`. No es un modelo entrenado desde cero por el autor del repositorio: es una conversión y distribución de los checkpoints de la familia Kokoro v1.1 para la variante china (`zh`), organizados con la estructura de rutas original del repositorio fuente.

El modelo resuelve el problema de desplegar TTS de alta calidad en entornos de producción sin depender de frameworks pesados de Python: al estar en ONNX, puede ejecutarse sobre el runtime de ONNX Runtime en múltiples plataformas, incluidos entornos embebidos y servidores sin GPU dedicada. La relevancia actual radica en la ligereza del paquete (0,1 GB) y en la disponibilidad de un conjunto amplio de voces predefinidas para chino mandarín (identificadores `zf_*` femeninos y `zm_*` masculinos), además de algunas voces en inglés (`af_*`, `bf_*`).

La información pública disponible es escasa: el repositorio no registra descargas ni interacciones, la model card es mínima y no se publican detalles de arquitectura, entrenamiento ni evaluación. La licencia se declara como `other`, heredada del repositorio fuente, que agrega checkpoints de distintos laboratorios con licencias heterogéneas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (síntesis de voz neuronal; detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | chino mandarín (voces `zf_*`, `zm_*`); inglés (voces `af_maple`, `af_sol`, `bf_vale`) |
| Licencia | other (heredada del repositorio fuente; phoonnx es Apache-2.0) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se basa en StyleTTS2, una arquitectura de síntesis de voz que combina un codificador de estilo y un decodificador acústico con un vocoder integrado, orientada a generar habla natural con control de prosodia y estilo. Sin embargo, la model card de este repositorio no aporta detalles sobre el tamaño de la red, la configuración de capas, el número de parámetros ni la composición del dataset de entrenamiento.

No se documenta en la información disponible si hubo entrenamiento adicional, ajuste fino, destilación ni procesos de alineación como RLHF. Tampoco se especifican los tokens o horas de audio utilizados, la procedencia de los datos ni las técnicas de aumento de datos. La única información técnica relevante es la conversión a ONNX y la organización de las voces bajo el prefijo `kokoro-v11/`, que sugiere una integración con el ecosistema Kokoro v1.1.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en chino mandarín e inglés, según las voces incluidas.
- Selección de voz mediante identificadores explícitos (`kokoro-v11/zf_001`, `kokoro-v11/zm_009`, etc.), con decenas de voces femeninas y masculinas en chino.
- Control de estilo y prosodia inherente a la arquitectura StyleTTS2 (no se documentan parámetros de control concretos en esta ficha).
- Ejecución sobre ONNX Runtime, lo que permite despliegue multiplataforma (CPU, GPU, entornos embebidos).
- Integración con la librería `phoonnx` para carga y síntesis.
- No se documentan capacidades de clonación de voz, emoción explícita, tool calling ni razonamiento multi-paso (no aplicables a un modelo TTS).

## Casos de uso

- **Lectura de contenidos en chino mandarín**: el modelo puede convertir artículos, documentación o noticias a audio utilizando las voces `zf_*` y `zm_*`, adecuadas para narración neutra en producción de podcasts o audiolibros.
- **Asistentes de voz embebidos**: al distribuirse en ONNX y ocupar 0,1 GB, puede integrarse en dispositivos con recursos limitados (Raspberry Pi, routers, electrodomésticos) para respuestas habladas en chino sin depender de la nube.
- **Accesibilidad web y aplicaciones móviles**: síntesis de texto a voz para lectores de pantalla en aplicaciones dirigidas a usuarios sinohablantes, con selección de voz masculina o femenina según preferencia.
- **Sistemas de megafonía y anuncios automatizados**: generación de avisos pregrabados en chino para transporte público, aeropuertos o comercios, usando una voz consistente y un runtime ligero.
- **Doblaje y localización de contenido**: producción de pistas de voz en chino para vídeos, tutoriales o cursos online, con la posibilidad de alternar entre voces para distintos personajes.
- **Prototipado de interfaces conversacionales**: pruebas de concepto de IVR (respuesta de voz interactiva) o chatbots de voz en chino, donde la latencia y el coste de infraestructura son críticos.
- **Generación de audiolibros y contenido educativo**: narración de materiales didácticos o textos largos en chino, con voces variadas para mantener la atención del oyente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible con precisión; el repositorio ocupa 0,1 GB, por lo que la inferencia en CPU es viable y la VRAM necesaria en GPU sería muy reducida (previsiblemente por debajo de 1 GB, aunque no se confirma).
- **GPU recomendadas**: no se especifican. Por el tamaño del paquete, cualquier GPU con soporte de ONNX Runtime (RTX 3060, RTX 4090, A100, H100) podría ejecutarlo, pero no hay datos de rendimiento publicados.
- **Consumer GPU**: sí, es probable que quepa en cualquier GPU de consumo e incluso en CPU, dado el tamaño del repositorio, aunque no se confirma oficialmente.
- **Opciones de despliegue**: ONNX Runtime (principal), librería `phoonnx`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS en este formato).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/styletts2-kokoro-v1.1-zh | no disponible | no aplica | no disponible | other | Hugging Face (0 descargas) |
| Kokoro (hexgrad/Kokoro-82M) | 82 M | no aplica | benchmarks públicos en la model card original | Apache-2.0 | Hugging Face, ampliamente usado |
| StyleTTS2 (yl4579/StyleTTS2) | no disponible | no aplica | benchmarks en el paper original | MIT (código) / otras para pesos | GitHub, Hugging Face |
| Piper (rhasspy/piper) | variable por voz | no aplica | no aplica | MIT | GitHub, Hugging Face |

La comparación es aproximada: este repositorio es una conversión ONNX de checkpoints Kokoro v1.1 para chino, por lo que su comportamiento debería ser cercano al del modelo Kokoro original, aunque no se aportan métricas que lo confirmen.

## Limitaciones y advertencias

- **Licencia ambigua**: se declara `other` y la model card fuente indica que los checkpoints provienen de distintos laboratorios con licencias heterogéneas; es imprescindible revisar la licencia del checkpoint original antes de un uso comercial.
- **Falta de documentación**: no hay información sobre arquitectura, entrenamiento, evaluación ni limitaciones conocidas, lo que dificulta la validación en producción.
- **Sesgos**: no documentados; al ser un modelo TTS entrenado con datos no especificados, puede reproducir sesgos de prosodia, acento o género presentes en el corpus original.
- **Riesgo de alucinación**: en TTS se traduce en pronunciaciones incorrectas, entonación anómala o artefactos en textos fuera del dominio de entrenamiento (números, siglas, nombres propios).
- **Cobertura idiomática limitada**: las voces principales son para chino mandarín; el inglés solo cuenta con tres voces (`af_maple`, `af_sol`, `bf_vale`), sin garantía de calidad equiparable.
- **Sin métricas de calidad**: no se publican MOS, WER ni comparativas objetivas, por lo que no se puede evaluar su rendimiento frente a alternativas.
- **Madurez del ecosistema**: el repositorio tiene 0 descargas y 0 likes, y la librería `phoonnx` es un proyecto emergente; el soporte comunitario puede ser limitado.
- **Formato ONNX**: aunque portátil, requiere ONNX Runtime y no es directamente compatible con frameworks como PyTorch o TensorFlow sin conversión.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/styletts2-kokoro-v1.1-zh
- Repositorio fuente: https://huggingface.co/Phoonnx/phoonnx-styletts2
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- StyleTTS2 (paper y código original): no disponible en la información proporcionada
- Kokoro (modelo base): no disponible en la información proporcionada
