# ritesh-das/credlayer-solana-fraud-gnn

## Resumen

CredLayer Solana Fraud GNN es un modelo de clasificación basado en redes neuronales de grafos (GNN) desarrollado por Ritesh Das (también conocido como Dyslex7c) como parte del proyecto CredLayer, un protocolo de reputación descentralizada para Web3 en la cadena Solana. El modelo combina arquitecturas GraphSAGE y GATv2 para detectar actividades fraudulentas en ecosistemas DeFi, como pools de liquidez maliciosos, tokens rug-pull y flujos de billeteras sospechosos.

El modelo fue entrenado con datos etiquetados de Solana, incluyendo el dataset SolRPDS (con más de 62.000 pools sospechosos y 22.000 tokens rug-pull derivados de 3.690 millones de transacciones), el dataset de Kaggle sobre Solana y datos de Solarchive. Aunque el pipeline en HuggingFace se indica como "tabular-classification", su naturaleza es puramente de grafo, procesando nodos y aristas para emitir una clasificación binaria de fraude.

La relevancia de este modelo radica en su enfoque específico para Solana, una de las cadenas con mayor actividad de DeFi y también con alta incidencia de estafas. Su licencia MIT permite uso comercial sin restricciones, aunque el repositorio no muestra descargas ni interacción, lo que sugiere que es un proyecto en fase temprana o de demostración.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GraphSAGE + GATv2 híbrido (SAGEConv, GATv2Conv, BatchNorm, Dropout) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de grafos, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (.pt) |

## Arquitectura y entrenamiento

El modelo implementa una arquitectura híbrida de tres capas:

- Capa 1: SAGEConv con 128 dimensiones, seguida de BatchNorm, ReLU y Dropout (0.3).
- Capa 2: GATv2Conv con 128 dimensiones y 4 cabezas de atención, seguida de BatchNorm, ELU y Dropout (0.3).
- Capa 3: SAGEConv con 64 dimensiones, BatchNorm, ReLU y una capa lineal final para la salida de clasificación binaria.

La función de pérdida es FocalLoss con gamma=2.0, diseñada para manejar el desequilibrio de clases típico en detección de fraude. Además, se utiliza GNNExplainer para proporcionar atribuciones de características y ranking de aristas, lo que facilita la interpretabilidad de las predicciones.

El entrenamiento se realizó con tres fuentes de datos: SolRPDS (62.895 pools de liquidez sospechosos y 22.195 tokens rug-pull confirmados), el dataset de Kaggle sobre Solana (con categorización de entidades) y Solarchive (flujos de transacciones diarias en formato Parquet). No se especifican detalles sobre el número total de parámetros, el proceso de optimización ni la duración del entrenamiento.

## Capacidades

- Clasificación de nodos y aristas en grafos de transacciones de Solana para detectar fraude.
- Identificación de pools de liquidez maliciosos y tokens rug-pull.
- Detección de flujos de billeteras fraudulentas.
- Generación de explicaciones a nivel de características y vecinos mediante GNNExplainer.
- Procesamiento de datos de grafos heterogéneos (transacciones, entidades, pools).
- No incluye capacidades de generación de texto, tool calling, agentes o razonamiento multi-paso; es exclusivamente un clasificador de grafos.

## Casos de uso

- Monitoreo en tiempo real de transacciones en Solana: el modelo puede integrarse en un sistema de streaming que analice nuevas transacciones y marque aquellas que presenten patrones de fraude, permitiendo a las plataformas DeFi bloquear operaciones sospechosas antes de que se ejecuten.
- Auditoría de contratos inteligentes: al analizar el grafo de interacciones de un nuevo token o pool, el modelo puede predecir si es probable que sea un rug-pull, ayudando a los inversores a tomar decisiones informadas antes de invertir.
- Sistema de reputación de billeteras: como parte del protocolo CredLayer, el modelo puede asignar una puntuación de riesgo a cada billetera basada en su historial de transacciones, útil para plataformas de préstamos o intercambios descentralizados.
- Análisis forense de incidentes: tras un ataque o estafa, los investigadores pueden usar el modelo para identificar billeteras cómplices y flujos de fondos ilícitos, facilitando la trazabilidad.
- Filtrado de tokens en exchanges descentralizados: los DEX pueden integrar el modelo para listar solo tokens que no presenten señales de fraude, reduciendo el riesgo para los usuarios.
- Integración en carteras de criptomonedas: una wallet puede alertar al usuario cuando está a punto de interactuar con una dirección o token clasificado como fraudulento por el modelo.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en el conjunto de prueba, aunque no se especifica la composición exacta de dicho conjunto:

| Metrica | Resultado |
|---|---|
| Accuracy | 100% |
| Precision (clase fraude) | 1.00 |
| Recall (clase fraude) | 1.00 |
| Macro F1 | 1.00 |
| AUROC | 1.00 |
| PR-AUC | 1.00 |

Estos valores perfectos son inusualmente altos y sugieren un posible sobreajuste al conjunto de entrenamiento o una partición de prueba demasiado sencilla. No se han publicado resultados comparativos con otros modelos de detección de fraude en grafos, ni se detallan métricas adicionales como precisión en clases negativas o rendimiento en datos fuera de distribución.

## Requisitos de hardware

- Al ser un modelo de grafos con solo tres capas y dimensiones de 128 y 64, el número de parámetros es reducido (probablemente menos de 1 millón, aunque no se especifica).
- La inferencia puede ejecutarse en CPU sin problemas, con tiempos de respuesta del orden de milisegundos para grafos pequeños.
- Para grafos grandes (miles de nodos), se recomienda una GPU con al menos 4 GB de VRAM, como una NVIDIA GTX 1650 o superior.
- No se requiere una GPU de alta gama; cualquier GPU moderna con soporte CUDA es suficiente.
- Opciones de despliegue: al ser un modelo PyTorch, puede servirse con TorchServe, o integrarse en una API usando FastAPI. No se mencionan formatos optimizados como ONNX o TensorRT.

## Comparativa con modelos similares

No se ha encontrado información sobre modelos comparables en el mismo dominio (detección de fraude en grafos de Solana) con los que se pueda realizar una comparación directa. Existen enfoques genéricos como LayerWeighted-GCN para fraude financiero, pero no se han publicado resultados comparativos con este modelo. Por tanto, esta sección queda no disponible.

## Limitaciones y advertencias

- Los resultados de evaluación perfectos son altamente sospechosos de sobreajuste; no se debe asumir que el modelo generalizará bien a datos no vistos.
- El modelo está entrenado exclusivamente con datos de la cadena Solana, por lo que no es aplicable a otras blockchains sin reentrenamiento.
- No se especifica el número de parámetros ni el tamaño del checkpoint, lo que dificulta estimar los requisitos de memoria.
- La fecha de creación del modelo (2026) es futura, lo que sugiere que puede tratarse de un proyecto experimental o con errores de fecha.
- No se dispone de información sobre el preprocesamiento de los grafos ni sobre cómo se construyeron las características de los nodos, lo que limita la reproducibilidad.
- Aunque la licencia es MIT, los datos de entrenamiento (SolRPDS, Kaggle, Solarchive) pueden tener sus propias restricciones de uso que no se detallan.
- El modelo no es un LLM y no puede generar explicaciones en lenguaje natural; las explicaciones son solo atribuciones técnicas.

## Enlaces

- HuggingFace: https://huggingface.co/ritesh-das/credlayer-solana-fraud-gnn
- GitHub del autor: https://github.com/Dyslex7c
- Repositorio del proyecto Cred-Layer: https://github.com/Zakariasisu5/Cred-Layer
- Web del proyecto CredLayer: https://credlayer1.vercel.app/
