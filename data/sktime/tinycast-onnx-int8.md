# sktime/tinycast-onnx-int8

## Resumen

TinyCast es un modelo fundacional de series temporales probabilístico y zero-shot, desarrollado por raws-labs y publicado bajo licencia Apache-2.0. Con solo 146.505 parámetros, prescinde por completo de la atención y emplea convoluciones causales dilatadas junto con un prior de fase basado en periodograma normalizado, lo que le permite pronosticar series no vistas sin ajuste previo. Esta ficha describe la exportación oficial a ONNX con cuantización int8 dinámica por canal, publicada por la organización sktime, que mantiene el mismo comportamiento predictivo con una huella de memoria mínima y apta para entornos embebidos.

La versión int8 ONNX cuantiza únicamente las capas de multiplicación de matrices (MatMul) a QInt8 dinámico por canal, mientras que las convoluciones dilatadas y las proyecciones de interfaz se mantienen en fp32. Según la model card, la precisión se ha verificado dentro del 4,1% del spread de pronóstico del predictor oficial en rollouts de 15 bloques, y la exportación fp32 se desvía solo un 0,0003%. El modelo acepta un contexto de 2048 valores y devuelve 9 cuantiles para 48 pasos futuros, con soporte para horizontes más largos mediante retroalimentación de la mediana.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional causal dilatada sin atención (TinyCast) |
| Parametros totales | 146.505 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 (entrada) |
| Tipos de cuantizacion | int8 dinámico por canal (QInt8) solo en MatMul; fp32 en el resto |
| Idiomas soportados | No disponible (modelo de series temporales, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo .onnx) |

## Arquitectura y entrenamiento

TinyCast reemplaza el mecanismo de atención por convoluciones causales dilatadas, lo que reduce drásticamente el coste computacional y permite la exportación a formatos cuantizados como int8. El modelo incorpora un prior de fase de periodograma normalizado con cero parámetros, que extrae la periodicidad directamente del contexto de entrada en lugar de aprenderla. Esta combinación hace que el camino de mezcla sea exclusivamente convoluciones y multiplicaciones de matrices, facilitando la inferencia en dispositivos embebidos sin ajuste por señal.

No se dispone de información detallada sobre el conjunto de datos de entrenamiento, el número de tokens o el uso de técnicas como RLHF o DPO. El paper asociado (arXiv:2608.15767v1) reporta que en los benchmarks Chronos-ZS y fev-bench, cualquier modelo neuronal que supera a TinyCast tiene al menos 28 veces más parámetros, lo que subraya su eficiencia. La exportación ONNX int8 fue realizada por sktime como un artefacto no oficial, no afiliado a los autores originales.

## Capacidades

- Pronóstico probabilístico zero-shot de series temporales univariadas, devolviendo 9 cuantiles (0.1 a 0.9) en lugar de una estimación puntual.
- Manejo de contextos de hasta 2048 valores, con soporte para horizontes de 48 pasos por llamada y extensión a horizontes mayores mediante retroalimentación de la mediana.
- Inferencia eficiente en CPU y dispositivos embebidos gracias a la cuantización int8 y la ausencia de atención.
- Exportación a ONNX Runtime, lo que permite integración en pipelines de producción con múltiples lenguajes (Python, C++, etc.).
- No soporta tool calling, agentes ni capacidades multimodales; es exclusivamente un modelo de pronóstico de series temporales.

## Casos de uso

- Pronóstico de demanda en retail: dado un historial de ventas diarias de 2048 días, el modelo genera cuantiles de demanda para las próximas 48 horas, permitiendo planificar inventario con intervalos de confianza.
- Monitorización de sensores industriales: predicción de lecturas de temperatura, presión o vibración en tiempo real, con alertas basadas en los cuantiles superiores para detectar anomalías.
- Predicción de tráfico en redes: a partir de series de uso de ancho de banda, se anticipan picos de carga y se dimensionan recursos de red de forma proactiva.
- Gestión energética: pronóstico de consumo eléctrico o generación renovable (eólica, solar) para optimizar el despacho y el almacenamiento.
- Mantenimiento predictivo: análisis de series de vibración o desgaste para estimar la vida útil restante de maquinaria, usando los cuantiles como umbrales de riesgo.
- Sistemas embebidos en IoT: al ser un modelo de 146k parámetros cuantizado a int8, puede ejecutarse en microcontroladores o Raspberry Pi para pronóstico local sin conexión a la nube.

## Benchmarks y rendimiento

No se han publicado resultados numéricos detallados de benchmarks en la información disponible. El paper menciona que en Chronos-ZS y fev-bench, los modelos que superan a TinyCast tienen al menos 28 veces más parámetros, pero no se proporcionan cifras concretas de error o métricas. La model card de la versión ONNX int8 indica una desviación máxima del 4,1% en el spread del pronóstico respecto al predictor oficial, y del 0,0003% para la exportación fp32, pero no hay comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB en fp32; con cuantización int8, el modelo ocupa menos de 50 MB, por lo que no requiere GPU dedicada.
- GPU recomendada: ninguna; el modelo está diseñado para CPU y dispositivos embebidos.
- Compatibilidad con GPU de consumo: sí, cualquier GPU moderna puede ejecutarlo, pero no es necesario.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), puede integrarse en sktime, o ejecutarse directamente con el runtime de ONNX en Python, C++ o Rust.
- Latencia y throughput: no se han publicado mediciones oficiales, pero dado el tamaño y la cuantización, se espera una latencia de milisegundos por llamada en CPU moderna y decenas de milisegundos en microcontroladores.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida | Licencia | Formato |
|---|---|---|---|---|---|
| TinyCast (int8 ONNX) | 146.505 | 2048 | 48 pasos, 9 cuantiles | Apache-2.0 | ONNX |
| Chronos (Amazon) | 20M-710M | 512 | 64 pasos, cuantiles | Apache-2.0 | PyTorch |
| TimesFM (Google) | 200M | 512 | 128 pasos, punto | Apache-2.0 | PyTorch |

TinyCast es significativamente más pequeño que Chronos y TimesFM, y su arquitectura sin atención permite una inferencia mucho más ligera. No se dispone de comparativas de rendimiento numérico en la información proporcionada, pero el paper indica que TinyCast compite con modelos de al menos 28 veces su tamaño en los benchmarks mencionados.

## Limitaciones y advertencias

- La exportación ONNX int8 no es oficial y no está afiliada a los autores del modelo original; puede haber diferencias sutiles en el comportamiento.
- El modelo no soporta valores NaN en la entrada; es necesario imputarlos (por ejemplo, con interpolación lineal) y rellenar por la izquierda con el primer valor válido.
- La cuantización int8 introduce un error de hasta el 4,1% en el spread del pronóstico, que puede ser relevante en aplicaciones de alta precisión.
- El contexto está fijado en 2048 valores; no se pueden procesar series más largas sin truncamiento o ventanas deslizantes.
- No se han documentado sesgos específicos, pero al ser un modelo de series temporales, su rendimiento puede degradarse en series con estacionalidades complejas o cambios de régimen no presentes en los datos de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la atribución y las condiciones de la versión base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sktime/tinycast-onnx-int8
- Modelo base: https://huggingface.co/raws-labs/tinycast
- Repositorio GitHub de TinyCast: https://github.com/raws-labs/tinycast
- Paper arXiv: https://arxiv.org/abs/2608.15767v1
- Framework sktime: https://www.sktime.net/
- Catálogo de modelos sktime: https://www.sktime.net/models/
