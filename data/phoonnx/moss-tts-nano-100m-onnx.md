# Phoonnx/moss-tts-nano-100m-onnx

## Resumen

moss-tts-nano-100m-onnx es un modelo de síntesis de voz (text-to-speech) publicado por el usuario Phoonnx en Hugging Face. Se trata de una exportación a formato ONNX del modelo MOSS TTS en su variante "nano" de aproximadamente 100 millones de parámetros, empaquetada específicamente para su uso con la librería phoonnx, un motor de TTS del ecosistema de TigreGotico. El repositorio forma parte de la colección más amplia Phoonnx/phoonnx-moss, de la que este repositorio constituye la carpeta `tts-nano-100m-onnx` conservando la estructura de rutas original.

El modelo resuelve el problema de la síntesis de voz multilingüe ligera y desplegable en entornos con recursos limitados, al ofrecer una variante de 100 millones de parámetros exportada a ONNX. La elección de ONNX como formato de pesos facilita la inferencia en CPU y en hardware heterogéneo mediante ONNX Runtime, lo que lo hace adecuado para aplicaciones de borde y despliegues sin GPU dedicada.

La información pública disponible es muy limitada: la model card no incluye detalles sobre arquitectura interna, datos de entrenamiento, benchmarks ni licencia específica por componente (solo la licencia Apache 2.0 del repositorio completo). La fecha de creación del repositorio es noviembre de 2026 y el tamaño total es de 0,8 GB. Los identificadores de voz listados cubren 19 idiomas, entre ellos español, inglés, alemán, francés, chino, japonés y coreano.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS de la familia MOSS, variante nano) |
| Parámetros totales | aproximadamente 100 millones (según el nombre del modelo) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; los pesos se distribuyen en formato ONNX |
| Idiomas soportados | 19 identificadores de voz: ar, cs, da, de, el, en, es, fa, fr, hu, it, ja, ko, pl, pt, ru, sv, tr, zh |
| Licencia | Apache 2.0 (según la model card del repositorio de origen) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. Por el nombre y la familia (MOSS TTS, variante nano de 100 millones de parámetros) se trata presumiblemente de un modelo de síntesis de voz neuronal, pero la model card no especifica si emplea un transformer, un modelo acústico basado en difusión, un vocoder neuronal o una combinación. Tampoco se detallan los datos de entrenamiento, el número de tokens, la composición del corpus ni si hubo etapas de ajuste fino con RLHF o DPO.

La innovación técnica documentada es la exportación a ONNX y la integración con la librería phoonnx, que permite invocar el modelo mediante identificadores de voz con el prefijo `mosstts/nano/<idioma>`. El repositorio conserva las rutas de archivos del repositorio matriz Phoonnx/phoonnx-moss, lo que sugiere que el modelo se distribuye como un artefacto dentro de un pipeline de TTS más amplio gestionado por phoonnx.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada.
- Soporte multilingüe con 19 identificadores de voz: árabe, checo, danés, alemán, griego, inglés, español, persa, francés, húngaro, italiano, japonés, coreano, polaco, portugués, ruso, sueco, turco y chino.
- Inferencia mediante ONNX Runtime, lo que permite ejecución en CPU y en aceleradores compatibles con ONNX.
- Integración nativa con la librería phoonnx mediante identificadores de voz.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Lectura de artículos y documentos en aplicaciones de accesibilidad: el modelo puede convertir texto a voz en 19 idiomas con un tamaño de 100 millones de parámetros, adecuado para ejecutarse en dispositivos de usuario sin depender de servicios en la nube.
- Asistentes de voz en el borde (edge computing): gracias a la exportación ONNX y al reducido tamaño, puede desplegarse en dispositivos con CPU limitada para respuestas habladas en tiempo real.
- Generación de audiolibros y contenido narrado: la variedad de identificadores de voz por idioma permite producir narraciones en múltiples lenguas desde un mismo motor.
- Localización de contenido multimedia: conversión de guiones a voz en los 19 idiomas soportados para doblaje o subtitulado asistido.
- Integración en pipelines de phoonnx: aplicaciones que ya usan la librería pueden seleccionar la voz `mosstts/nano/<idioma>` para síntesis sin gestionar manualmente los pesos ONNX.
- Sistemas de anuncios y notificaciones habladas: la baja latencia esperada de un modelo de 100 millones de parámetros en ONNX Runtime lo hace apto para mensajes cortos en interfaces de usuario.
- Prototipado e investigación en TTS: al ser un modelo pequeño y con licencia Apache 2.0, sirve como base para experimentación y ajuste en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; un modelo de 100 millones de parámetros en ONNX ocupa del orden de 0,4 GB en precisión FP32 y aproximadamente 0,2 GB en FP16, aunque el repositorio completo pesa 0,8 GB.
- GPU recomendadas: no disponibles; al ser un modelo ONNX, puede ejecutarse en CPU y en GPU compatibles con ONNX Runtime (CUDA, DirectML, etc.).
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el reducido tamaño, aunque no se documentan requisitos oficiales.
- Opciones de despliegue: ONNX Runtime y la librería phoonnx; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, riesgo de alucinación ni limitaciones específicas de contexto o idioma.
- La licencia Apache 2.0 se declara para el repositorio de origen completo; no se detalla si algún componente concreto (pesos, vocoder, tokenizador) tiene condiciones distintas.
- No se especifican los datos de entrenamiento, lo que impide evaluar sesgos de género, acento o dominio.
- El modelo está empaquetado específicamente para la librería phoonnx; su uso fuera de ese ecosistema requiere cargar manualmente los archivos ONNX y gestionar el pipeline de TTS.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación en producción.
- La fecha de creación (noviembre de 2026) y la ausencia de documentación adicional limitan la confianza en las especificaciones declaradas.
- No se documentan límites de longitud de texto de entrada ni comportamiento en textos largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Phoonnx/moss-tts-nano-100m-onnx
- Repositorio de origen: https://huggingface.co/Phoonnx/phoonnx-moss
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
