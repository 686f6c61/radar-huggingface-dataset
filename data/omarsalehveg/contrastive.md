# OmarSalehveg/contrastive

## Resumen

El repositorio OmarSalehveg/contrastive contiene una implementación compacta y personalizada en PyTorch de una arquitectura Perceiver orientada a tareas contrastivas, publicada por el usuario OmarSalehveg bajo licencia Apache 2.0. No se trata de un modelo preentrenado ni ajustado, sino de un artefacto de código acompañado de un checkpoint de inicialización válido únicamente para pruebas de humo (smoke tests), revisión de código y experimentos controlados de pequeña escala.

A pesar de que la model card etiqueta la configuración como "giant", el recuento real de parámetros en los pesos safetensors es de 24.832, una cifra que no se corresponde con ninguna escala de producción. El propio autor advierte que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio.

Su relevancia es por tanto acotada: sirve como andamiaje reproducible para estudiar la arquitectura Perceiver con atención de consulta agrupada (grouped query), fusión bilineal, activación mish y normalización scalenorm, y como punto de partida para construir experimentos propios, no como modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver |
| Parametros totales | 24.832 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Escala declarada | giant (denominacion de la configuracion) |
| Tipo de atencion | Grouped query |
| Fusion | Bilineal |
| Activacion | Mish |
| Normalizacion | Scalenorm |
| Optimizador por defecto | LAMB |
| Planificador | Step |
| Tamano del repositorio | 0,0 GB |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-10-09 |

## Arquitectura y entrenamiento

La arquitectura es un Perceiver, un transformer que proyecta las entradas sobre un array latente de dimensión reducida mediante cross-attention, lo que en principio permite procesar entradas de gran tamaño sin escalar cuadráticamente con la longitud de la secuencia. En esta implementación concreta se especifican atención de tipo grouped query, fusión bilineal entre representaciones, función de activación mish y normalización scalenorm. La configuración de entrenamiento por defecto usa el optimizador LAMB con un planificador del tipo step.

No hay evidencia de entrenamiento completado. El autor indica explícitamente que los valores de la receta incluida son puntos de partida del script y no el resultado de una ejecución finalizada, y que el checkpoint safetensors es una inicialización válida para pruebas, no un modelo entrenado. Tampoco se documenta el volumen de tokens, la composición del dataset ni el uso de RLHF, DPO o cualquier etapa de alineamiento. La model card recomienda entrenar todas las líneas base con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias antes de extraer cualquier conclusión.

## Capacidades

No hay capacidades verificadas, dado que el checkpoint no ha sido entrenado.

- Generacion de texto: no disponible; el modelo no está entrenado.
- Razonamiento, código o matemáticas: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Aprovechamiento real del artefacto: servir como implementación de referencia de Perceiver para contrastive learning, ejecutable mediante `python inference.py --help` y con un entrenamiento de prueba en el bloque `__main__`.
- Carga: al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito.

## Casos de uso

- Pruebas de humo de infraestructura: el checkpoint de inicialización permite validar pipelines de carga de safetensors, serialización y ejecución en GPU o CPU sin depender de un modelo pesado ni de una descarga grande.
- Revisión de código de arquitecturas Perceiver: el script principal y `config.json` documentan de forma explícita la atención grouped query, la fusión bilineal y la normalización scalenorm, lo que facilita auditar decisiones de diseño.
- Prototipado de investigación en aprendizaje contrastivo: sirve como base editable sobre la que implementar funciones de pérdida contrastivas y medir su comportamiento antes de invertir en cómputo a gran escala.
- Docencia y formación: al tener 24.832 parámetros y ocupar apenas decenas de kilobytes en disco, es adecuado para explicar el flujo de cross-attention de un Perceiver en un aula o tutorial sin requerir hardware especializado.
- Validación de pipelines de datos: permite comprobar de extremo a extremo el preprocesado, el batching y el registro de métricas con un coste de cómputo prácticamente nulo.
- Integración en CI/CD: puede incorporarse como caso de prueba en integración continua para verificar que los cambios en el resto del sistema no rompen la carga de safetensors, la inicialización de pesos ni la ejecución de `inference.py`.
- Línea base de capacidad mínima: al ser un modelo diminuto, resulta útil como referencia de cota inferior ("matched-capacity baseline") frente a implementaciones mayores en experimentos comparativos.
- Reproducción de configuraciones de optimización: prueba configuraciones con LAMB y planificador step para estudiar su estabilidad en un entorno controlado y de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card declara que no se reclama ninguna puntuación de benchmark y que el checkpoint no es un artefacto entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB. Con 24.832 parámetros, los pesos ocupan aproximadamente 99 KB en fp32 y unos 50 KB en fp16.
- GPU recomendadas: ninguna en particular; cualquier GPU, incluida una integrada, es suficiente. Modelos como RTX 4090, A100 o H100 están sobredimensionados para este artefacto.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso en CPU sin aceleración.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la carga debe hacerse con el código propio del repositorio (`inference.py`) mediante un adaptador explícito.
- Latencia y throughput estimados: no disponibles. No hay datos medidos publicados.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la información proporcionada. El repositorio es un artefacto de implementación y no un modelo entrenado, por lo que una comparación por parámetros, contexto o rendimiento con modelos de producción no resultaría significativa.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| OmarSalehveg/contrastive | 24.832 | no disponible | Apache 2.0 | Checkpoint de inicializacion, sin entrenar |
| Perceiver IO (referencia conceptual) | no disponible | no disponible | no disponible | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado; sus salidas no tienen significado funcional.
- No ha sido auditado en robustez, equidad o transferencia de dominio, según reconoce el propio autor.
- No se han publicado puntuaciones de benchmark, por lo que no existen métricas de calidad que respalden su uso.
- La longitud de contexto, los idiomas soportados y los esquemas de cuantización no están documentados.
- La etiqueta "giant" de la configuración no refleja el tamaño real del modelo (24.832 parámetros), lo que puede inducir a error si se interpreta como indicador de escala.
- La carga mediante APIs automáticas genéricas requiere un adaptador explícito al tratarse de una implementación personalizada.
- Aunque la licencia es Apache 2.0 y permite uso comercial, los términos de los datos de origen deben revisarse por separado si se emplea con conjuntos externos.
- Riesgo de alucinación: no aplica de forma medible en un modelo sin entrenar; cualquier salida debe considerarse no fiable.
- Para producción no se recomienda su uso en ningún escenario hasta que exista un checkpoint entrenado y documentado de forma independiente.

## Enlaces

- HuggingFace: https://huggingface.co/OmarSalehveg/contrastive
