# ricemonster/Text-to-CadQuery-Qwen2.5-0.5B

## Resumen

Text-to-CadQuery-Qwen2.5-0.5B es un ajuste fino supervisado de parámetros completos (full-parameter SFT) del modelo base Qwen/Qwen2.5-0.5B-Instruct, desarrollado por el usuario ricemonster. Su propósito específico es traducir descripciones en lenguaje natural de piezas y geometrías CAD a programas Python ejecutables escritos con la biblioteca CadQuery. Resuelve un problema muy concreto dentro del diseño asistido por ordenador: la brecha entre la intención expresada en texto y el código paramétrico necesario para generar el modelo 3D.

El modelo conserva la arquitectura transformer decoder-only de la familia Qwen2.5, con 494.032.768 parámetros, y se distribuye en formato safetensors con un tamaño de repositorio de 2,0 GB. Al estar construido sobre una variante de 0,5B, está pensado para entornos con recursos limitados, inferencia en CPU o GPU de gama baja y prototipado rápido de pipelines text-to-CAD.

Su relevancia actual radica en la especialización: frente a modelos generalistas que pueden generar código CadQuery de forma inconsistente, este ajuste se ha entrenado específicamente sobre el dataset ricemonster/Text-to-CadQuery. Forma parte de una familia de cuatro tamaños (0,5B, 1,5B, 3B y 7B) con el mismo propósito, lo que permite escalar según los requisitos de calidad y hardware. El modelo declara únicamente el idioma inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-0.5B-Instruct, un transformer decoder-only de la familia Qwen2.5 con atención causal estándar. Sobre esa base se ha realizado un ajuste fino supervisado de parámetros completos (full-parameter SFT), es decir, se actualizan todos los pesos del modelo y no solo adaptadores. El dataset de entrenamiento es ricemonster/Text-to-CadQuery, compuesto por pares de descripciones en lenguaje natural y programas CadQuery.

El formato de prompt empleado en el ejemplo de la model card sigue una plantilla de instrucción/respuesta: `### Instruction:\n{descripcion}\n\n### Response:\n`. La generación de referencia usa `do_sample=False`, lo que sugiere que el modelo está pensado para producir código determinista. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO posteriores al SFT. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de código Python para CadQuery a partir de descripciones textuales de geometrías CAD.
- Traducción de instrucciones de diseño mecánico (bloques, agujeros pasantes, cilindros, operaciones booleanas) a programas ejecutables.
- Generación de texto conversacional heredada del modelo base Qwen2.5-0.5B-Instruct.
- Especialización en un dominio técnico acotado (text-to-CAD), no en código general.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Prototipado de piezas paramétricas: el usuario describe una pieza en inglés y el modelo genera el script CadQuery correspondiente, que puede ejecutarse para obtener el modelo 3D y modificarse después a mano.
- Automatización de catálogos de componentes: generar variantes de una pieza (cambiar dimensiones, añadir taladros) mediante descripciones textuales en lote, reduciendo el trabajo manual de modelado.
- Asistente integrado en herramientas de diseño: conectar el modelo a un editor o notebook para que el ingeniero escriba la intención y obtenga código CadQuery listo para ejecutar.
- Educación y formación en CAD paramétrico: usar el modelo para mostrar cómo se traduce una descripción geométrica en código, útil en cursos de diseño mecánico o programación CAD.
- Generación de datasets sintéticos: producir pares texto-código CadQuery adicionales para ampliar corpus de entrenamiento o evaluación en el dominio text-to-CAD.
- Despliegue en entornos con recursos limitados: al tener 0,5B parámetros, puede ejecutarse en CPU o en GPUs de gama baja para pruebas locales, demos o prototipos sin infraestructura dedicada.
- Pipeline de CI para validación geométrica: generar código CadQuery y ejecutarlo en un paso de integración para comprobar que las descripciones producen geometrías válidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en bfloat16 para los 494M parámetros (sin contar overhead de activaciones y caché KV); en cuantización de 8 bits o 4 bits el requisito sería aún menor, aunque no se documentan cuantizaciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para bfloat16; tarjetas como RTX 3060, RTX 4060 o superiores son suficientes. También puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con suficiente VRAM; incluso en CPU es viable para prototipos.
- Opciones de despliegue: transformers (según el ejemplo de la model card), y potencialmente llama.cpp, Ollama o vLLM si se generan conversiones compatibles, aunque no se documentan en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Text-to-CadQuery-Qwen2.5-0.5B | 494 M | no disponible | no disponible | Text-to-CadQuery especializado |
| Text-to-CadQuery-Qwen2.5-1.5B | no disponible | no disponible | no disponible | Text-to-CadQuery especializado |
| Text-to-CadQuery-Qwen2.5-3B | no disponible | no disponible | no disponible | Text-to-CadQuery especializado |
| Text-to-CadQuery-Qwen2.5-7B | no disponible | no disponible | no disponible | Text-to-CadQuery especializado |

Las alternativas más directas son los otros tamaños de la misma familia publicada por el mismo autor. No se dispone de datos de benchmarks ni de comparativas con modelos generalistas en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; las descripciones en castellano u otros idiomas pueden degradar la calidad de la generación.
- Es un ajuste fino sobre una base de 0,5B, por lo que su capacidad de razonamiento y de manejar descripciones complejas es limitada en comparación con los tamaños mayores de la familia.
- Riesgo de alucinación: puede generar código CadQuery sintácticamente plausible pero geométricamente incorrecto o no ejecutable; se recomienda validar siempre la salida ejecutándola.
- La licencia no está disponible en la información proporcionada, por lo que no puede confirmarse el uso comercial; conviene verificar la licencia del modelo base Qwen2.5-0.5B-Instruct y del repositorio antes de usarlo en producción.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- No se especifican la longitud de contexto efectiva ni las cuantizaciones publicadas, lo que dificulta planificar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ricemonster/Text-to-CadQuery-Qwen2.5-0.5B
- Dataset: https://huggingface.co/datasets/ricemonster/Text-to-CadQuery
- Colección Text-to-CadQuery: https://huggingface.co/collections/ricemonster/text-to-cadquery-6b0a2cabae152d0d6f0fc823
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Variante 1.5B: https://huggingface.co/ricemonster/Text-to-CadQuery-Qwen2.5-1.5B
- Variante 3B: https://huggingface.co/ricemonster/Text-to-CadQuery-Qwen2.5-3B
- Variante 7B: https://huggingface.co/ricemonster/Text-to-CadQuery-Qwen2.5-7B
