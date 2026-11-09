# AXERA-TECH/Qwen3.5-9B-VL-AX8860-SGLang

## Resumen

AXERA-TECH/Qwen3.5-9B-VL-AX8860-SGLang es un artefacto publicado en Hugging Face por AXERA-TECH que, por su identificador, corresponde a una adaptación del modelo multimodal Qwen3.5-9B-VL orientada al acelerador AX8860 y al motor de inferencia SGLang. El nombre combina tres elementos: la familia base (Qwen3.5, en su variante de 9.000 millones de parámetros con capacidad visión-lenguaje), el hardware objetivo (el chip AX8860 de Axera) y el stack de servicio (SGLang). Se trata, por tanto, de un paquete de despliegue o de pesos preparados para un entorno de inferencia concreto, no de un modelo entrenado desde cero por AXERA-TECH.

La relevancia de esta ficha es acotada: el repositorio no incluye model card sustantiva (el README solo declara la licencia BSD-3-Clause), no registra descargas ni interacciones y no aporta información sobre arquitectura, datos de entrenamiento, benchmarks ni requisitos. La fecha de creación y actualización es la misma (2026-11-09), lo que sugiere una publicación inicial sin iteraciones posteriores documentadas.

Dado que la información disponible es mínima, esta ficha distingue explícitamente entre lo que se puede inferir del identificador y lo que no está disponible. Cualquier dato sobre el modelo base Qwen3.5-9B-VL debe verificarse en la ficha oficial de dicho modelo, no en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (por el identificador, se presupone transformer multimodal del modelo base Qwen3.5-9B-VL; no confirmado en el repositorio) |
| Parametros totales | no disponible (el identificador sugiere ~9B; no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (el sufijo SGLang sugiere compatibilidad con ese motor, pero no se detalla el formato) |

## Arquitectura y entrenamiento

No hay información en el repositorio sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens, la composición del dataset ni el uso de RLHF, DPO u otras técnicas de alineación. El identificador apunta a que se reutiliza el modelo Qwen3.5-9B-VL como base, pero no se documenta ninguna modificación de pesos, destilación ni ajuste fino específico para el acelerador AX8860.

Tampoco se especifica si el repositorio contiene pesos completos, pesos cuantizados, artefactos de compilación para el chip AX8860 o únicamente configuraciones y scripts de integración con SGLang. Esta ambigüedad es relevante para cualquier evaluación técnica: sin esa información no es posible determinar si el rendimiento esperado coincide con el del modelo base o si existen degradaciones por la adaptación al hardware.

## Capacidades

- No se documentan capacidades específicas en el repositorio.
- Por el identificador "VL" se presupone entrada de imagen y texto, pero no está confirmado ni detallado.
- No se indica soporte de tool calling, function calling ni razonamiento multi-paso.
- No se indica soporte multilingüe ni idiomas cubiertos.
- No se indica modo de razonamiento explícito (thinking mode), audio u otras modalidades.
- No se documenta ninguna capacidad adicional más allá de la licencia.

## Casos de uso

- Despliegue en hardware AX8860: el repositorio parece orientado a ejecutar el modelo Qwen3.5-9B-VL sobre el acelerador AX8860 mediante SGLang; sería el caso de uso principal, aunque no se aportan instrucciones ni métricas.
- Evaluación de compatibilidad con SGLang: útil para equipos que ya operan SGLang y quieren probar el modelo en ese motor, siempre que verifiquen previamente el contenido real del repositorio.
- Integración en entornos edge o embebidos: si el paquete incluye artefactos compilados para AX8860, podría emplearse en escenarios con restricciones de consumo energético, aunque no hay datos que lo confirmen.
- Prototipado multimodal: si los pesos están completos, permitiría experimentar con tareas de visión-lenguaje, pero la falta de documentación obliga a validar el comportamiento empíricamente.
- Referencia para adaptaciones de modelos Qwen a aceleradores: puede servir como ejemplo de empaquetado para otros equipos que realicen integraciones similares.
- Auditoría de licencia: el repositorio declara BSD-3-Clause, lo que facilita su uso comercial con atribución, aunque conviene verificar que la licencia del modelo base Qwen3.5-9B-VL sea compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible; el identificador apunta al acelerador AX8860 de Axera, no a GPU convencionales.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: SGLang es el motor sugerido por el identificador; no se documentan otras alternativas como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables con adaptaciones equivalentes al acelerador AX8860 ni paquetes SGLang del mismo tipo. La comparación con el modelo base Qwen3.5-9B-VL requeriría datos que este repositorio no aporta.

## Limitaciones y advertencias

- Ausencia total de model card: no hay información sobre arquitectura, entrenamiento, datos ni evaluación.
- Cero descargas y cero interacciones: no hay evidencia de uso comunitario ni de validación externa.
- Riesgo de que el repositorio contenga únicamente artefactos de despliegue y no pesos utilizables directamente.
- Licencia BSD-3-Clause declarada, pero sin verificación de compatibilidad con la licencia del modelo base Qwen3.5-9B-VL; conviene revisar ambas antes de un uso comercial.
- Posibles sesgos y alucinaciones del modelo base no documentados en este repositorio.
- Sin información sobre idiomas, contexto máximo ni cuantizaciones, lo que impide planificar producción con garantías.
- Fecha de publicación futura respecto a la mayoría de referencias habituales; verificar que el repositorio sea el definitivo y no un borrador.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3.5-9B-VL-AX8860-SGLang
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código o demos.
