# Phoonnx/vits-hitz-ca_pau

## Resumen

vits-hitz-ca_pau es un modelo de síntesis de voz (text-to-speech) en formato ONNX, publicado por el usuario Phoonnx como un subconjunto del repositorio agregador Phoonnx/phoonnx-vits. Se trata de un modelo VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) exportado para su uso con la librería phoonnx, un motor de inferencia TTS basado en ONNX Runtime desarrollado en el repositorio TigreGotico/phoonnx. El identificador de voz asociado es `hitz/ca_pau-vits`.

El modelo resuelve la conversión de texto a audio en un único paso end-to-end, una de las ventajas principales de la arquitectura VITS frente a pipelines en cascada (texto a fonemas, fonemas a mel-espectrograma, mel a waveform). Su relevancia es limitada en términos de impacto: cuenta con cero descargas y cero likes en el momento de la consulta, y su publicación se produce dentro de un agregador de voces, no como un lanzamiento independiente con model card propia y detallada.

El tamaño del repositorio es de aproximadamente 0,1 GB, coherente con un checkpoint VITS de tamaño pequeño-medio. La información pública disponible es escasa: no se especifican parámetros totales, longitud de contexto (concepto poco aplicable a TTS), idiomas soportados ni composición del dataset de entrenamiento. El sufijo `ca_pau` sugiere una voz en catalán (posiblemente asociada a un hablante o variante denominada "pau"), pero esta interpretación no está confirmada en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, exportado a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica en TTS) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el identificador sugiere catalán, sin confirmar) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un encoder de texto, un prior y un posterior variacional sobre representaciones latentes, un decoder generativo basado en flujos normalizadores y un vocoder HiFi-GAN integrado, todo entrenado de forma conjunta con pérdidas adversarias y de reconstrucción. El resultado es un modelo que genera waveform directamente desde la secuencia de texto o fonemas, sin necesidad de un vocoder separado en inferencia. En este caso, el modelo se distribuye como grafo ONNX para su ejecución con phoonnx.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el hablante o hablantes utilizados, ni sobre si se aplicaron técnicas de ajuste fino o alineamiento adicionales. La model card es mínima y se limita a indicar que el modelo proviene del repositorio Phoonnx/phoonnx-vits, carpeta `hitz-ca_pau`, y que conserva las rutas de ficheros del repositorio original. No se documentan innovaciones técnicas específicas más allá de las propias de la arquitectura VITS.

## Capacidades

- Síntesis de voz a partir de texto (pipeline `text-to-speech`), generando audio en un único paso end-to-end.
- Ejecución mediante ONNX Runtime a través de la librería phoonnx, lo que permite despliegue en entornos sin dependencias de PyTorch.
- Identificador de voz `hitz/ca_pau-vits` para su selección dentro del catálogo de phoonnx.
- No se documenta soporte de control de estilo, emoción, prosodia explícita, clonación de voz, ni multi-hablante.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no aplicable a un modelo TTS).
- Capacidades multilingües: no disponibles; el nombre sugiere catalán pero no está confirmado.

## Casos de uso

- Lectura de contenido web o documentos: el modelo puede convertir texto en audio para aplicaciones de accesibilidad o lectura por voz, al ser un TTS ligero en ONNX adecuado para inferencia en servidor o en el navegador mediante ONNX Runtime Web.
- Asistentes de voz embebidos: su formato ONNX y su reducido tamaño de repositorio (0,1 GB) facilitan la integración en aplicaciones de escritorio o móviles con phoonnx como motor.
- Generación de avisos y notificaciones habladas: para sistemas que necesitan sintetizar mensajes cortos de forma local sin depender de servicios en la nube.
- Prototipado de interfaces conversacionales: útil en fase de desarrollo para validar flujos de voz antes de invertir en un TTS comercial, dado que la licencia MIT permite uso sin restricciones.
- Síntesis offline en entornos con conectividad limitada: al ejecutarse con ONNX Runtime, puede desplegarse en dispositivos sin acceso a APIs externas.
- Evaluación comparativa de voces dentro del catálogo phoonnx: permite probar la voz `hitz/ca_pau-vits` frente a otras del mismo repositorio agregador para seleccionar la más adecuada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB) y la naturaleza de un checkpoint VITS en ONNX, es probable que quepa en GPUs de gama baja e incluso en CPU, pero no se aportan cifras oficiales.
- GPU recomendadas: no disponibles. Un modelo VITS de este tamaño suele ejecutarse en CPU con latencia aceptable para frases cortas, y en GPUs consumer (por ejemplo, RTX 3060 o superiores) con margen amplio, aunque no hay datos publicados que lo confirmen.
- ¿Cabe en GPU consumer? Muy probablemente sí, dado el tamaño del artefacto, pero no confirmado por el autor.
- Opciones de despliegue: phoonnx (librería indicada en la model card) sobre ONNX Runtime. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| vits-hitz-ca_pau | VITS | ONNX | MIT | no disponible | Hugging Face (Phoonnx) |
| Piper (voces comunitarias) | VITS | ONNX | variable por voz | múltiples | GitHub / Hugging Face |
| Coqui TTS (VITS) | VITS | PyTorch | MPL-2.0 (código) | múltiples | GitHub / Hugging Face |
| MMS-TTS (Meta) | VITS | PyTorch | CC-BY-NC 4.0 | 1100+ | Hugging Face |

La comparación con Piper es la más directa, ya que phoonnx está orientado a voces en formato ONNX compatibles con el ecosistema Piper. No obstante, no se dispone de datos de rendimiento (MOS, latencia) para establecer una comparación cuantitativa con ninguno de estos modelos.

## Limitaciones y advertencias

- Información muy escasa: la model card no documenta idioma, hablante, dataset ni métricas, lo que dificulta evaluar su calidad antes de integrarlo.
- El nombre `ca_pau` sugiere catalán, pero no está confirmado oficialmente; podría tratarse de otra lengua o variante.
- Riesgo de alucinación y artefactos de audio: como todo modelo TTS generativo, puede producir pronunciaciones incorrectas, ruidos o inestabilidades en textos largos o con caracteres fuera del dominio de entrenamiento.
- Sesgos: no documentados; al desconocerse el dataset, no se puede evaluar el sesgo de hablante, género o registro.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero la model card advierte que la licencia sigue la del repositorio original por subcarpeta y que algunas voces del agregador carecen de licencia definida (`license: other`). Conviene verificar la procedencia concreta de la carpeta `hitz-ca_pau` antes de un uso comercial.
- Sin mantenimiento aparente: cero descargas y publicación reciente sin actividad, lo que reduce la probabilidad de soporte o correcciones.
- No apto para clonación de voz ni control de emociones: la arquitectura y la documentación no lo contemplan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-hitz-ca_pau
- Repositorio agregador de origen: https://huggingface.co/Phoonnx/phoonnx-vits
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
