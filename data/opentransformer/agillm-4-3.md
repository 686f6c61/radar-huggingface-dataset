# OpenTransformer/AGILLM-4.3

## Resumen

AGILLM-4.3 es un modelo de lenguaje de gran tamaño desarrollado por la organización OpenTransformer, publicado en HuggingFace con acceso restringido (gated). Se trata de la versión 4.3 de la serie AGILLM, que según el repositorio de GitHub asociado parte de un warm start de AGILLM 4.2 e incorpora dos innovaciones principales: expertos compartidos en una arquitectura de mezcla de expertos (MoE) y bloques de difusión (DiffusionBlocks) durante el entrenamiento. El tamaño del repositorio en HuggingFace es de 714.3 GB, lo que sugiere un modelo de gran escala, aunque no se han publicado especificaciones detalladas sobre el número de parámetros, la longitud de contexto o los idiomas soportados.

El modelo se presenta como parte de una iniciativa de democratización de la inteligencia artificial mediante código abierto, pero su acceso está restringido y requiere aceptar condiciones adicionales en HuggingFace. La escasa documentación pública y la ausencia de resultados de benchmarks dificultan una evaluación técnica completa en este momento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con routers top-1 discretos y DiffusionBlocks |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

Según la información disponible en el repositorio de GitHub vinculado, AGILLM-4.3 se construye como un warm start de AGILLM 4.2, es decir, inicializa sus pesos a partir de la versión anterior. La arquitectura emplea una mezcla de expertos (MoE) con routers top-1 discretos, lo que significa que cada token se enruta a un único experto en cada capa. Además, incorpora expertos compartidos (shared MoE experts) y utiliza bloques de difusión (DiffusionBlocks) durante el entrenamiento, una técnica que combina el paradigma de difusión con el procesamiento secuencial de transformers. No se han publicado detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO. El archivo de runtime de compatibilidad se denomina `agillm41.py`, lo que indica cierta continuidad con la versión 4.1.

## Capacidades

No se dispone de información pública detallada sobre las capacidades específicas de AGILLM-4.3. El repositorio de GitHub menciona la existencia de un modo experimental llamado EGGROLL que añade una estrategia de evolución para los routers MoE, pero esto es una extensión opcional y no una capacidad del modelo base. Dado el tamaño del repositorio (714.3 GB) y la arquitectura MoE, es razonable asumir que el modelo puede manejar tareas de generación de texto a gran escala, pero no hay documentación que confirme capacidades concretas como tool calling, razonamiento multi-paso, soporte de agentes o capacidades multimodales. Se recomienda consultar la documentación oficial una vez que el acceso sea concedido.

## Casos de uso

No se han documentado casos de uso específicos para AGILLM-4.3 en las fuentes disponibles. Dada la falta de especificaciones técnicas y benchmarks, no es posible recomendar aplicaciones concretas con fundamento. Cualquier uso en producción requeriría primero una evaluación exhaustiva del modelo tras obtener acceso. Se recomienda esperar a que OpenTransformer publique documentación adicional o resultados de evaluación antes de considerar su adopción en escenarios reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio (714.3 GB) sugiere que el modelo requiere una cantidad considerable de VRAM, probablemente en el rango de cientos de gigabytes incluso con cuantización agresiva.
- No se dispone de información sobre la VRAM estimada para inferencia, GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- Dado el tamaño, es poco probable que el modelo quepa en GPUs de consumo (por ejemplo, RTX 4090 con 24 GB) sin una cuantización extrema que podría degradar significativamente la calidad.
- Se recomienda contactar con el equipo de OpenTransformer para obtener orientación sobre hardware y despliegue.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma categoría (MoE con DiffusionBlocks) con especificaciones públicas en el momento de redactar esta ficha.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar condiciones adicionales en HuggingFace, lo que limita su uso y evaluación independiente.
- Documentación insuficiente: no se han publicado especificaciones técnicas completas, benchmarks ni guías de uso.
- Licencia desconocida: al no especificarse la licencia, no es posible determinar si el uso comercial está permitido.
- Riesgo de alucinación: al ser un modelo de lenguaje sin evaluación pública, no se puede descartar la generación de contenido falso o inexacto.
- Sesgos potenciales: no se ha publicado información sobre la composición del dataset de entrenamiento, por lo que los sesgos son desconocidos.
- Estado experimental: la existencia de repositorios experimentales (EGGROLL) sugiere que el modelo y su ecosistema están en desarrollo activo y pueden cambiar sin aviso.
- Para producción, se recomienda encarecidamente esperar a que OpenTransformer publique documentación oficial y resultados de evaluación.

## Enlaces

- [HuggingFace: OpenTransformer/AGILLM-4.3](https://huggingface.co/OpenTransformer/AGILLM-4.3)
- [GitHub: Marxist-Leninist/AGILLM4.3](https://github.com/Marxist-Leninist/AGILLM4.3)
- [GitHub: AGILLM 4.3 EGGROLL Experimental](https://github.com/Marxist-Leninist/AGILLM4.3-EGGROLL-Experimental)
- [llms.info: OpenTransformer/AGILLM-4.3](https://llms.info/models/opentransformer-agillm-4-3-1001)
