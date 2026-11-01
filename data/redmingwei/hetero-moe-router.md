# redmingwei/hetero-moe-router

## Resumen

`redmingwei/hetero-moe-router` es un repositorio de HuggingFace que no contiene un modelo entrenado listo para inferencia, sino un registro de experimentos fallidos o parcialmente exitosos sobre enrutamiento en arquitecturas de mezcla de expertos (MoE) heterogéneas. Lo publica el usuario `redmingwei` y agrupa tres experimentos previos que originalmente estaban en repositorios separados (`hetero-moe-router-unfrozen` y `hetero-moe-shared-routed`), ahora consolidados en subdirectorios y con los originales archivados.

El problema que aborda es el colapso del enrutador (router collapse) en arquitecturas MoE multimodales: los expertos se especializan por modalidad en lugar de por contenido, de modo que el router no aprende una asignación útil. La model card documenta tres variantes (expertos congelados, expertos descongelados y esquema shared+routed) y concluye que la causa raíz es que la función objetivo depende solo de la modalidad y no del contenido, por lo que el router no recibe gradiente de contenido.

Es relevante ahora como material de referencia negativo para investigadores que trabajen en MoE multimodales y balanceo de carga: documenta qué configuraciones no funcionan y por qué, y enlaza a la versión posterior (`HeteroMoEProjSpace-v2`) donde, según el autor, el problema se corrige. No es un modelo desplegable: los pesos son `state_dict` crudos de PyTorch, no compatibles con `from_pretrained`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) heterogénea con router; variante shared+routed en el subdirectorio `shared-routed/` |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `state_dict` crudo, no cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `state_dict` de PyTorch guardado con `torch.save` (no es formato `from_pretrained`) |

## Arquitectura y entrenamiento

El repositorio documenta tres configuraciones experimentales sobre una misma base MoE. En la raíz se encuentra el experimento original (v33) con expertos congelados; en `unfrozen/` una variante con pesos de expertos descongelados e inicializados aleatoriamente (el propio `report.json` aclara que es un experimento independiente y no la configuración v33 del proyecto); y en `shared-routed/` una arquitectura con la forma `y = x + SharedExpert(fusion) + routed experts(dispatch)`.

Los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. La model card sí reporta métricas de entrenamiento: la pérdida de tarea pasa de 52.97 a 13.09 con expertos congelados, a 0.112 con expertos descongelados y a 0.10 en la variante shared+routed. En el caso descongelado, la carga de expertos resultante es `[0.295, 0.814, 0.890, 0.001]`, lo que evidencia colapso hacia un subconjunto de expertos; en shared+routed la carga es `[0.001, 0.999, 0.9997, 0.0001]`, también con colapso del router. La parte de fusión de la variante shared+routed sí funciona: la similitud coseno entre modalidades sube de 0.029 a 0.107 y la proporción de correlación positiva de 73.8% a 96.7%. El autor atribuye el fallo del router a que la función objetivo depende de la modalidad y no del contenido.

## Capacidades

- No es un modelo de inferencia: no genera texto, no razona y no responde a prompts.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües declaradas.
- No dispone de modo thinking, visión ni audio utilizables.
- Su función es documental: registrar resultados negativos y semi-exitosos de experimentos de enrutamiento MoE.

## Casos de uso

- Reproducción de experimentos de colapso de router: sirve para contrastar configuraciones de congelación y descongelación de expertos y observar las curvas de pérdida y las cargas por experto reportadas.
- Estudio de balanceo de carga en MoE: las cargas `[0.295, 0.814, 0.890, 0.001]` y `[0.001, 0.999, 0.9997, 0.0001]` permiten analizar patrones de colapso y diseñar funciones auxiliares de balanceo.
- Diseño de arquitecturas shared+routed: la variante `shared-routed/` documenta una implementación concreta de experto compartido más expertos enrutados que puede tomarse como referencia estructural.
- Investigación en fusión multimodal: las métricas de similitud coseno entre modalidades (0.029 a 0.107) y de correlación positiva (73.8% a 96.7%) sirven como línea base para evaluar técnicas de fusión.
- Referencia para revisión por pares o informes técnicos: al ser un registro de resultados negativos con licencia Apache 2.0, puede citarse y reutilizarse en publicaciones sobre MoE.
- Punto de partida hacia la versión corregida: la model card enlaza a `HeteroMoEProjSpace-v2`, con held-out 0.9016, balanceo 0.8774 y entropía de router 0.5016, útil para comparar antes y después de la corrección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente que las curvas de pérdida de `report.json` no deben citarse como métricas de rendimiento.

| Métrica reportada (entrenamiento) | Raíz (congelado) | `unfrozen/` | `shared-routed/` |
|---|---|---|---|
| Pérdida de tarea (inicio → fin) | 52.97 → 13.09 | 52.97 → 0.112 | 52.97 → 0.10 |
| Carga de expertos | no disponible | [0.295, 0.814, 0.890, 0.001] | [0.001, 0.999, 0.9997, 0.0001] |
| Probes | 0.390 / 0.296 | 0.256 / 0.266 | no disponible |
| Veredicto | router no aprendió | colapso | fusión correcta, router colapsado |

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0.0 GB y no se declaran parámetros.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamaño del modelo.
- Opciones de despliegue: no aplica; los pesos son `state_dict` crudos de PyTorch y no cargan con `from_pretrained`, por lo que vLLM, llama.cpp, Ollama o TGI no son utilizables directamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables de la misma categoría con parámetros, contexto o licencia verificables en la información suministrada.

## Limitaciones y advertencias

- No es un modelo funcional: no debe usarse para inferencia, generación ni tareas de producción.
- Los pesos son `state_dict` de `torch.save`, no un formato `from_pretrained`; requieren reconstruir la arquitectura manualmente para cargarlos.
- Las curvas de pérdida de `report.json` no son métricas de rendimiento y no deben citarse como tales.
- Los experimentos documentados presentan colapso de router; la variante `unfrozen/` usa pesos de expertos inicializados aleatoriamente y no corresponde a la configuración v33 del proyecto.
- No hay información sobre sesgos, idiomas, datos de entrenamiento ni riesgos de alucinación porque el artefacto no es un modelo de lenguaje desplegable.
- La licencia Apache 2.0 permite uso comercial del contenido, pero al no haber un modelo utilizable el punto es en gran medida irrelevante en la práctica.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/redmingwei/hetero-moe-router
- Modelo completo enlazado por el autor: https://huggingface.co/redmingwei/HeteroMoEProjSpace-v2
