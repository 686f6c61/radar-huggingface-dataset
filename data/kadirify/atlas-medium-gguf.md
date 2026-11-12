# kadirify/atlas-medium-GGUF

## Resumen

Atlas Medium es un ajuste fino (fine-tune) del modelo google/gemma-4-E4B-it orientado a la corrección ortográfica y al uso general del turco. Lo desarrolla kadirify como componente del asistente de escritorio local Atlas, un proyecto de código abierto que funciona íntegramente en local. No se trata de un modelo entrenado desde cero: parte de los pesos de Gemma 4 E4B y aplica un LoRA que después se fusiona en el modelo base.

El modelo resuelve un problema concreto: mejorar la calidad del turco escrito, especialmente la detección y corrección de errores ortográficos, sin degradar el rendimiento general en turco. Según la model card, la tasa de acierto en un test de ortografía de 300 casos sube del 64,7 % en el modelo base al 88,0 % en Atlas Medium, y en un test difícil de 187 casos pasa del 51,3 % al 83,4 %.

La distribución publicada en Hugging Face es una cuantización GGUF Q6_K de 6,2 GB, pensada para ejecutarse con Ollama (`ollama run kadirify/atlas-medium`). Los pesos completos en safetensors suman 7.518.069.290 parámetros. La licencia es Apache 2.0, la misma que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/gemma-4-E4B-it; detalles de la arquitectura base no disponibles) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q6_K (6,2 GB); se menciona también una build Q4_K_M usada para el test difícil |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); safetensors (modelo base) |

## Arquitectura y entrenamiento

Atlas Medium es un fine-tune por LoRA del modelo google/gemma-4-E4B-it, con los adaptadores fusionados en el modelo base. El entrenamiento usó LoRA con r=16 y alpha=32, una sola época y 8.955 ejemplos. El conjunto de datos combina frases en turco corrompidas mediante reglas junto con sus versiones corregidas, más ejemplos generales en turco e inglés generados con Gemma 4 E4B. Todo el entrenamiento se ejecutó en una única RTX 5070 de 12 GB, y los scripts están disponibles en la carpeta `training/` del repositorio Atlas.

No se documentan innovaciones arquitectónicas propias: el modelo hereda la arquitectura del base y el trabajo se concentra en el ajuste de comportamiento lingüístico. La model card no detalla la composición exacta del dataset ni el número de tokens de entrenamiento, ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO.

## Capacidades

- Generación de texto conversacional en turco e inglés, heredada del modelo base Gemma 4 E4B.
- Corrección ortográfica en turco: detección y reparación de errores de escritura en frases.
- Uso general del turco, con ejemplos de entrenamiento específicos para este idioma.
- Conversación multi-turno (etiqueta `conversational` en el repo).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Corrección ortográfica de textos en turco: el modelo recibe una frase con errores y devuelve la versión corregida; es el caso para el que fue entrenado y donde muestra la mejora más clara frente al base (88,0 % frente a 64,7 % en el test estándar).
- Asistente de escritorio local: integrado en Atlas, permite revisar y corregir texto sin enviar datos a la nube, gracias a su ejecución íntegramente local vía Ollama.
- Preprocesado de contenido en turco: normalizar y corregir textos generados por usuarios antes de almacenarlos o indexarlos en un pipeline.
- Revisión de borradores en entornos educativos o editoriales de lengua turca, con revisión humana posterior dado que las correcciones no son perfectas.
- Chat general bilingüe turco-inglés en aplicaciones de escritorio, aprovechando que el modelo conserva el rendimiento general del base (97,2 frente a 97,3 en Atlas-TR).
- Prototipado rápido de aplicaciones de PLN en turco sobre hardware de consumo, al poder desplegarse con Ollama en una GPU de 12 GB.

## Benchmarks y rendimiento

| Benchmark | gemma4:e4b (base) | Atlas Medium |
|---|---:|---:|
| Test de ortografía (300 casos), % | 64,7 | 88,0 |
| Test de ortografía difícil (187 casos), % | 51,3 | 83,4 |
| Atlas-TR general (92 preguntas) | 97,3 | 97,2 |

Notas de la model card: el test difícil se midió sobre la build Q4_K_M, y su valor base corresponde al modelo base pasado por la misma cadena de conversión. Atlas-TR es una prueba pequeña de 92 preguntas, por lo que diferencias de 1-2 puntos no son significativas.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q6_K ocupa 6,2 GB, por lo que se necesita al menos esa cantidad más el overhead de contexto; una GPU de 8-12 GB es suficiente para la build publicada.
- GPU recomendadas: RTX 5070 (12 GB) fue la usada para el entrenamiento; cualquier GPU consumer con 8 GB o más puede ejecutar la cuantización Q6_K. Para la build Q4_K_M bastaría con menos VRAM.
- GPU de consumo: sí, cabe en tarjetas consumer de gama media-alta (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 5070, etc.).
- Opciones de despliegue: Ollama (`ollama run kadirify/atlas-medium`); al ser GGUF, también es compatible con llama.cpp y otros runners GGUF. Compatibilidad con vLLM o TGI: no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Atlas Medium | 7.518.069.290 | no disponible | tr, en | Apache 2.0 | GGUF |
| google/gemma-4-E4B-it (base) | no disponible | no disponible | no disponible | Apache 2.0 (según la model card) | safetensors |
| Otras alternativas de corrección ortográfica en turco | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es frente al modelo base, donde Atlas Medium mejora claramente en ortografía (88,0 frente a 64,7) y mantiene el rendimiento general (97,2 frente a 97,3). No se dispone de datos sobre otros modelos comparables de la misma categoría.

## Limitaciones y advertencias

- Los tests de ortografía se generaron con corrupción por reglas; el modelo no se ha probado por separado con texto escrito por personas reales.
- El benchmark Atlas-TR consta solo de 92 preguntas, por lo que sus resultados tienen escasa significación estadística.
- Las correcciones no son siempre perfectas; la model card recomienda revisar manualmente los textos importantes.
- El alcance lingüístico se limita a turco e inglés; no hay evidencia de rendimiento en otros idiomas.
- No se documentan sesgos conocidos ni tasas de alucinación.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base google/gemma-4-E4B-it antes de desplegarlo en producción.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación por parte de la comunidad.
- No hay información sobre la longitud de contexto efectiva ni sobre soporte de tool calling o agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kadirify/atlas-medium-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio del asistente Atlas: https://github.com/kadirify/atlas
