# Radinkazemian/kodr

## Resumen

Kodr es un modelo de generación de juegos desarrollado por Radinkazemian, basado en un modelo de código de la clase Qwen3 de 27B con pesos abiertos. Está entrenado mediante QLoRA (cuantización de 4 bits) y posteriormente fusionado en un único checkpoint independiente. El modelo está diseñado para convertir ideas de diseño en juegos funcionales, generando código para motores como Roblox Luau, Unity C#, Godot GDScript y Unreal C++, así como mapas en formato JSON.

La relevancia de Kodr radica en su enfoque específico en la generación de contenido para videojuegos, un campo donde los modelos generalistas suelen producir código fragmentado. Al entrenarse con un dataset curado por motor, el modelo pretende ofrecer scripts de gameplay, sistemas completos y niveles listos para compilar. Su licencia Apache-2.0 permite uso comercial y modificación. La longitud de contexto es de 1024 tokens, lo que limita la generación de proyectos muy extensos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en un modelo coder de la clase Qwen3 (27B) |
| Parametros totales | 27B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kodr parte de un modelo de referencia de la clase Qwen3 con 27B de parámetros, descrito como un "modelo coder" de pesos abiertos. El entrenamiento se realizó con QLoRA, una técnica que combina cuantización de 4 bits con adaptadores de bajo rango, lo que permite ajustar un modelo grande con recursos limitados. Tras el entrenamiento, los adaptadores se fusionan en un único checkpoint standalone, eliminando el modelo de referencia.

El dataset utilizado, Radinkazemian/kodr-dataset, es pequeño y curado a mano por motor, según la documentación del autor. No se menciona el número exacto de tokens ni la composición detallada. Tampoco se indica si se aplicaron técnicas como RLHF o DPO. Una innovación destacable es el soporte para generar mapas en un formato JSON propio (`kodr-map-v1`), que incluye heightmaps, puntos de aparición, iluminación, reglas y objetos, y que puede compilarse a un motor específico mediante una herramienta Python.

## Capacidades

- Generación de código completo para motores de videojuegos: controladores, sistemas de combate, inventarios, guardado, sistemas de rondas e IA de enemigos.
- Soporte para motores Roblox Luau, Unity C#, Godot GDScript y Unreal C++.
- Generación de mapas en formato JSON (`kodr-map-v1`) con heightmap, spawns, iluminación, reglas y objetos.
- Compilación de mapas a un motor concreto mediante el script `python model/tools/compile_map.py map.json --engine roblox`.
- Integración con el formato de chat de Hugging Face Transformers, usando plantillas de conversación.
- No se especifica soporte de tool calling, function calling, visión ni audio.

## Casos de uso

- Prototipado rápido de niveles: un diseñador puede describir una arena de parkour con saltos de pared y un anillo de lava, y obtener un script base para Roblox o Unity en segundos, acelerando la iteración de diseño.
- Generación de sistemas de inventario: el modelo puede producir un script completo de gestión de objetos, equipamiento y persistencia para un juego de rol, listo para integrarse en el proyecto.
- Creación de IA de enemigos: se pueden generar comportamientos de enemigos con máquinas de estados, detección de jugador y rutas de patrulla en GDScript o C++, reduciendo el tiempo de implementación.
- Generación de mapas procedurales: mediante el formato `kodr-map-v1`, se pueden crear mapas con spawns y objetos, y compilarlos a un motor objetivo, lo que facilita la generación de niveles en juegos de tipo arena o roguelike.
- Soporte a equipos multidisciplinares: artistas o diseñadores sin experiencia en programación pueden generar código funcional para sus prototipos, siempre que el contexto de 1024 tokens sea suficiente para la tarea.
- Documentación y ejemplos de código: el modelo puede servir para generar ejemplos de código específicos de un motor, útiles en tutoriales o como base para formación de nuevos desarrolladores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- No se proporcionan datos sobre si el modelo cabe en GPU de consumo.
- Opciones de despliegue: se menciona el uso de `transformers` y `torch` para carga local. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

Dado que el modelo tiene 27B de parámetros, se espera que requiera hardware de gama alta, pero no se ofrecen cifras concretas en la documentación.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La longitud de contexto de 1024 tokens es muy corta para generar proyectos de código extensos, lo que puede provocar respuestas truncadas o incompletas.
- El dataset de entrenamiento es pequeño y curado a mano, por lo que la cobertura de casos de uso puede ser limitada y el modelo puede no generalizar bien a motores o patrones no vistos.
- No se han publicado benchmarks, por lo que el rendimiento real frente a otros modelos de código es desconocido.
- Riesgo de alucinación: como en cualquier modelo generativo, puede producir código que parezca plausible pero que no compile o no funcione correctamente.
- La licencia Apache-2.0 permite uso comercial, pero es necesario revisar la licencia del dataset y de los componentes heredados del modelo base.
- No se especifican los idiomas soportados, por lo que el rendimiento en lenguajes distintos del inglés no está garantizado.

## Enlaces

- Hugging Face: https://huggingface.co/Radinkazemian/kodr
- Dataset en Hugging Face: https://huggingface.co/datasets/Radinkazemian/kodr-dataset
