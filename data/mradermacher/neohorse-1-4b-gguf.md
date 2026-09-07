# mradermacher/NeoHorse-1-4B-GGUF

## Resumen

NeoHorse-1-4B-GGUF es una cuantización estática en formato GGUF del modelo NeoHorse-1-4B, creado originalmente por el usuario de HuggingFace TokenRhythm. La conversión ha sido realizada por mradermacher, un autor conocido por publicar cuantizaciones de modelos open source. El repositorio contiene múltiples niveles de cuantización (Q2_K, Q4_K_S, Q8_0, etc.) que permiten ejecutar el modelo en hardware con distintos niveles de memoria.

La información pública sobre el modelo original es muy limitada: no se especifican arquitectura, contexto, licencia, ni capacidades. Tampoco se han publicado resultados de benchmarks. Por ello, esta ficha se basa únicamente en los datos disponibles en HuggingFace y marca como "no disponible" aquellos aspectos no confirmados.

El modelo resulta relevante para quienes buscan una opción de 4B parámetros ejecutable en CPU o GPU mediante llama.cpp, aunque sin documentación técnica es difícil validar su idoneidad para casos concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 4B (deducido del nombre del modelo, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo original, los datos de entrenamiento, ni procesos de alineación como RLHF o DPO. Al ser una cuantización GGUF, el modelo base se ha convertido a este formato mediante herramientas de cuantización, pero no se aportan detalles técnicos adicionales sobre la estructura o el entrenamiento del modelo.

## Capacidades

- No se han publicado capacidades específicas del modelo en la información disponible.

## Casos de uso

- No es posible determinar casos de uso concretos: la información disponible no incluye capacidades ni rendimiento del modelo base. Cualquier aplicación sería especulativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Estimación general para modelos de 4B parámetros en formato GGUF: con cuantización Q4_K_S, el archivo ocupa aproximadamente 2,5 GB; con Q8_0, unos 4,5 GB; y con F16, unos 8 GB.
- Una GPU con 8 GB de VRAM puede ejecutar la mayoría de las cuantizaciones disponibles. Se recomienda una RTX 3060 o superior para una experiencia fluida.
- También es posible ejecutar el modelo en CPU mediante llama.cpp, aunque la velocidad será menor.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier otra aplicación compatible con formato GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre el modelo base para compararlo con alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que no se puede confirmar si el modelo es de código abierto o si su uso comercial está permitido.
- La falta de documentación sobre el modelo base impide conocer sus sesgos, riesgos de alucinación o limitaciones de contexto.
- Al tratarse de una cuantización, pueden existir pérdidas de precisión respecto al modelo original, aunque no se dispone de métricas para cuantificarlas.
- No hay información sobre idiomas soportados, lo que impide saber si el modelo funciona adecuadamente en español o en otros idiomas.

## Enlaces

- https://huggingface.co/mradermacher/NeoHorse-1-4B-GGUF
- https://huggingface.co/TokenRhythm/NeoHorse-1-4B
- https://huggingface.co/mradermacher
- https://huggingface.co/mradermacher/model_requests
