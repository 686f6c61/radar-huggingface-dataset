# DakeraAI/bge-reranker-v2-m3-ONNX

## Resumen

`DakeraAI/bge-reranker-v2-m3-ONNX` es un espejo verificado del reranker `BAAI/bge-reranker-v2-m3`, publicado por Dakera, la empresa detrás de un motor de memoria a largo plazo para agentes de IA autoalojado. No se trata de un modelo nuevo ni de un ajuste fino: es una copia byte a byte de los ficheros que Dakera consume de la versión ONNX comunitaria (`onnx-community/bge-reranker-v2-m3-ONNX`), con los hashes SHA-256 documentados en la model card. El repositorio existe para que las instalaciones de Dakera no dependan de una única fuente de descarga y para que la imagen Docker del producto arranque con los modelos ya incluidos.

El modelo subyacente es un cross-encoder de la familia BGE v2 de BAAI, empleado para reordenar (reranking) los candidatos recuperados por un sistema de búsqueda vectorial o híbrida. Frente a un bi-encoder, que codifica consulta y documento por separado, el cross-encoder procesa el par completo y produce una puntuación de relevancia más precisa, a costa de un mayor coste computacional por par evaluado. Esto lo hace idóneo como segunda etapa de un pipeline RAG, no como motor de recuperación principal.

La relevancia actual del repositorio es acotada: es un artefacto de distribución para un producto concreto (Dakera), no una publicación de investigación. El valor para terceros está en disponer de los pesos en formato ONNX cuantizado a int8 (570 MB) con verificación de integridad, listos para inferencia en CPU o GPU sin dependencias de PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder transformer (hereda la de BAAI/bge-reranker-v2-m3) |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int8 (fichero `onnx/model_int8.onnx`) |
| Idiomas soportados | aproximadamente 100 idiomas (segun la model card de Dakera) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (modelo int8 de 570.727.094 bytes) + `tokenizer.json` |
| Tamano del repositorio | 0,6 GB |
| Pipeline | text-ranking |
| Libreria | onnx |
| Modelo base | BAAI/bge-reranker-v2-m3 |

## Arquitectura y entrenamiento

Este repositorio no incluye información sobre arquitectura ni entrenamiento propios: es un espejo. La model card remite explícitamente a la tarjeta original de `BAAI/bge-reranker-v2-m3` para los detalles de entrenamiento, composición del dataset y metodología. Lo único documentado aquí es el proceso de empaquetado: dos ficheros copiados byte a byte desde `onnx-community/bge-reranker-v2-m3-ONNX`, con sus hashes SHA-256 publicados para verificación.

El artefacto distribuido es una exportación ONNX cuantizada a int8 del cross-encoder original. La cuantización int8 reduce el peso del fichero a unos 570 MB y permite inferencia eficiente en CPU, lo que encaja con el caso de uso de Dakera: un binario Rust autoalojado que debe funcionar en servidores sin GPU dedicada. El tokenizador se distribuye por separado (`tokenizer.json`, 17 MB). No se documentan en esta tarjeta innovaciones técnicas adicionales como decodificación especulativa o atención lineal; el modelo es un reranker, no un generador.

## Capacidades

- Puntuación de relevancia consulta-documento mediante cross-encoder (text-ranking).
- Reranking de candidatos recuperados en pipelines RAG de dos etapas.
- Cobertura multilingüe de aproximadamente 100 idiomas, según la model card.
- Inferencia en formato ONNX, ejecutable con ONNX Runtime en CPU o GPU.
- Integración como componente por defecto en Dakera (`DAKERA_RERANKER_MODEL=bge-reranker-v2-m3`).
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- Reranking en pipelines RAG: tras una recuperación vectorial o híbrida que devuelve, por ejemplo, 50-100 candidatos, el cross-encoder reordena los mejores antes de pasarlos al LLM generador, mejorando la precisión del contexto inyectado.
- Memoria a largo plazo de agentes: es el reranker por defecto de Dakera, que lo aplica sobre los candidatos recuperados de la memoria persistente del agente antes de construir el contexto de la conversación.
- Búsqueda documental multilingüe: al cubrir alrededor de 100 idiomas, permite reordenar resultados en escenarios donde consulta y documento están en idiomas distintos.
- Despliegue en CPU sin GPU: la versión int8 en ONNX permite servir el reranker en servidores convencionales, adecuado para instalaciones autoalojadas con presupuesto de hardware limitado.
- Verificación de integridad en entornos regulados: los hashes SHA-256 publicados permiten auditar que los pesos desplegados coinciden exactamente con los esperados.
- Sustitución de dependencia de una única fuente: al servir como espejo, permite configurar una ruta de descarga alternativa en instalaciones que no pueden acceder a los repositorios originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye métricas del reranker; únicamente menciona, como dato del producto Dakera (no del modelo), un 88,2 % de Recall@20 en el benchmark LoCoMo de memoria a largo plazo, que corresponde al sistema completo y no a este componente aislado.

## Requisitos de hardware

- VRAM estimada: el fichero int8 ocupa 570 MB; en ejecución con ONNX Runtime se puede mantener por debajo de 1-2 GB de memoria, dependiendo del tamaño de lote y de la longitud de las secuencias.
- GPU recomendadas: no se especifican en la información disponible; al ser un modelo pequeño y cuantizado, es viable en GPU de gama media e incluso en CPU.
- GPU de consumo: cabe holgadamente en cualquier GPU con 4 GB o más de VRAM; también es funcional en CPU.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio); la model card menciona la imagen Docker de Dakera (`ghcr.io/dakera-ai/dakera:latest`) que incluye los modelos preinstalados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Formato | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|
| DakeraAI/bge-reranker-v2-m3-ONNX | ONNX | int8 | Apache-2.0 | Espejo verificado del modelo de BAAI; sin cambios en los pesos |
| BAAI/bge-reranker-v2-m3 | safetensors (original) | múltiples | Apache-2.0 | Modelo original de BAAI; referencia para arquitectura y entrenamiento |
| onnx-community/bge-reranker-v2-m3-ONNX | ONNX | int8 | Apache-2.0 | Exportación ONNX comunitaria; fuente directa de los ficheros de este repositorio |

No se dispone de datos de benchmarks para comparar el rendimiento relativo frente a otros rerankers en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo original: cualquier limitación del modelo base `BAAI/bge-reranker-v2-m3` aplica íntegramente aquí; consúltese la tarjeta original para sesgos y riesgos conocidos.
- Solo se distribuye la variante int8; no hay pesos en otros formatos ni precisiones en este repositorio.
- No es un modelo generativo: no puede usarse para generación de texto, código, razonamiento ni tool calling.
- La información sobre longitud de contexto y número de parámetros no está disponible en esta tarjeta; debe consultarse la del modelo original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación por parte de la comunidad.
- Uso comercial: la licencia Apache-2.0 lo permite, pero conviene verificar los términos del modelo original de BAAI, que es la referencia autoritativa.
- La fecha de creación indicada (2026-11-04) aparece en los metadatos; verifíquese su coherencia antes de citarla.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DakeraAI/bge-reranker-v2-m3-ONNX
- Modelo original: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Exportación ONNX comunitaria (fuente de los ficheros): https://huggingface.co/onnx-community/bge-reranker-v2-m3-ONNX
- Licencia en el repositorio: https://huggingface.co/DakeraAI/bge-reranker-v2-m3-ONNX/blob/main/LICENSE
- Sitio web de Dakera: https://dakera.ai
- Documentación de Dakera: https://dakera.ai/docs
- GitHub de Dakera: https://github.com/Dakera-AI
- Despliegue autoalojado (Docker, Kubernetes, Helm): https://github.com/Dakera-AI/dakera-deploy
- Servidor MCP: https://github.com/Dakera-AI/dakera-mcp
- SDK Python: https://github.com/Dakera-AI/dakera-py
- SDK TypeScript: https://github.com/Dakera-AI/dakera-js
- SDK Go: https://github.com/Dakera-AI/dakera-go
- SDK Rust: https://github.com/Dakera-AI/dakera-rs
- LinkedIn: https://www.linkedin.com/company/dakera-ai
