# Phoonnx/vits-hitz-ca_ona

## Resumen

vits-hitz-ca_ona es un modelo de síntesis de voz (text-to-speech) en formato ONNX, publicado por el usuario Phoonnx dentro de su repositorio agregador Phoonnx/phoonnx-vits. Se trata de una extracción de la carpeta `hitz-ca_ona` de dicho repositorio, que conserva las rutas de ficheros originales y se distribuye como un artefacto autónomo listo para su uso con la librería phoonnx (implementación en Python de TigreGotico para inferencia TTS basada en ONNX).

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un sistema neuronal extremo a extremo que mapea texto a forma de onda mediante un codificador de texto, un prior variacional, un decoder generativo y un discriminador adversarial durante el entrenamiento. La etiqueta `ca` en el nombre sugiere un modelo orientado a catalán, aunque la model card no lo confirma explícitamente y el campo de idiomas no está disponible.

Su relevancia es acotada: no es un modelo fundacional ni compite con sistemas TTS neuronales grandes, sino un artefacto de despliegue ligero (0,1 GB de repositorio) pensado para inferencia en CPU o entornos embebidos mediante ONNX Runtime. El interés principal reside en su integración con el ecosistema phoonnx y en su licencia MIT declarada, que facilita su reutilización comercial, aunque la procedencia exacta de los datos de entrenamiento no se documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech extremo a extremo, ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de texto a nivel de fonema; no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; se desconoce si incluye variantes cuantizadas) |
| Idiomas soportados | no disponible (el identificador sugiere catalán, `ca`, sin confirmación en la model card) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura generativa condicionada por texto que combina un codificador de texto con atención, un prior variacional normalizado por flujo, un decoder basado en redes convolucionales y un discriminador multiperiodo durante el entrenamiento. El objetivo de entrenamiento combina pérdida adversarial, pérdida de reconstrucción espectral y una pérdida de alineamiento monotónico (MAS) que aprende la correspondencia entre fonemas y frames de audio sin supervisión explícita de alineamientos.

En esta ficha no se dispone de información sobre el conjunto de datos de entrenamiento: ni el número de horas de audio, ni los hablantes, ni la procedencia del corpus, ni si se aplicaron técnicas de post-procesado o ajuste fino. La model card únicamente indica que el modelo procede de la carpeta `hitz-ca_ona` del repositorio Phoonnx/phoonnx-vits y que los ficheros conservan sus rutas originales. No se documentan innovaciones técnicas adicionales más allá de las propias de VITS.

## Capacidades

- Síntesis de voz a partir de texto (pipeline `text-to-speech`), con salida de forma de onda.
- Inferencia mediante ONNX Runtime a través de la librería phoonnx.
- Identificador de voz expuesto por phoonnx: `hitz/ca_ona-vits`.
- Presumiblemente orientado a catalán por el sufijo `ca` del nombre de carpeta, sin confirmación documental.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).
- No se documentan capacidades multilingües, clonación de voz, control de estilo, emoción ni prosodia explícita.
- No se documenta modo thinking, visión ni audio de entrada.

## Casos de uso

- Lectura de artículos y documentos en catalán: el modelo puede convertir texto plano en audio para aplicaciones de accesibilidad o lectura por voz, siempre que se valide previamente la calidad del idioma y la pronunciación, dado que la cobertura lingüística no está confirmada.
- Integración en asistentes de voz locales: al distribuirse como ONNX y ejecutarse con phoonnx, puede embeberse en pipelines de respuesta por voz en entornos sin conectividad, con un consumo de disco de aproximadamente 0,1 GB.
- Síntesis en aplicaciones de escritorio y móviles: el formato ONNX permite despliegue multiplataforma vía ONNX Runtime, incluyendo dispositivos sin GPU dedicada.
- Generación de avisos y notificaciones habladas: útil en sistemas de megafonía, domótica o señalización industrial donde se requiere una voz sintética ligera y determinista.
- Prototipado de interfaces conversacionales: sirve como componente TTS en pruebas de concepto de asistentes por voz antes de migrar a modelos comerciales de mayor calidad.
- Evaluación comparativa de voces VITS: útil para investigadores que quieran contrastar la calidad de esta voz concreta frente a otras del repositorio phoonnx-vits bajo la misma librería de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB) y la naturaleza de VITS, se espera un consumo de memoria muy bajo, del orden de cientos de MB, aunque no se documenta.
- GPU recomendadas: no disponibles; VITS en ONNX suele ejecutarse en CPU sin problema, y cualquier GPU con soporte de ONNX Runtime (por ejemplo, series RTX o A100/H100) podría acelerar la inferencia, pero no hay datos publicados.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el reducido tamaño, aunque no se confirma.
- Opciones de despliegue: librería phoonnx sobre ONNX Runtime; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoonnx/vits-hitz-ca_ona | VITS (ONNX) | no aplica | no disponible (probable catalán) | MIT | ONNX | Hugging Face |
| Piper (voces comunitarias) | VITS (ONNX) | no aplica | múltiples | variable por voz | ONNX | Hugging Face / GitHub |
| Coqui TTS (modelos VITS) | VITS | no aplica | múltiples | MPL-2.0 / variable | PyTorch, ONNX | GitHub / Hugging Face |

No se dispone de datos de rendimiento comparativos publicados para este modelo concreto, por lo que la comparación se limita a aspectos de arquitectura, licencia y formato.

## Limitaciones y advertencias

- La model card no documenta el corpus de entrenamiento, los hablantes ni la calidad del audio resultante; la evaluación de calidad debe hacerse empíricamente.
- El idioma real del modelo no está confirmado; el sufijo `ca` sugiere catalán, pero podría tratarse de una convención de nombres interna del repositorio.
- Riesgo de pronunciación incorrecta en palabras fuera del vocabulario o en dominios especializados (nombres propios, terminología técnica, siglas).
- No se documentan sesgos de género, acento o registro; al desconocerse los datos de entrenamiento, no pueden evaluarse.
- La licencia MIT se declara en la model card, pero la propia card advierte que las licencias del repositorio origen siguen a los originales por subcarpeta; conviene verificar la procedencia antes de un uso comercial.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- No apto para clonación de voz ni para control fino de prosodia o emoción según la documentación disponible.
- La fecha de creación indicada (2026-11-14) es posterior a la fecha habitual de consulta; conviene tratar los metadatos con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-hitz-ca_ona
- Repositorio origen: https://huggingface.co/Phoonnx/phoonnx-vits
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Referencia de voces Piper (kasanoma): https://github.com/michsethowusu/kasanoma
