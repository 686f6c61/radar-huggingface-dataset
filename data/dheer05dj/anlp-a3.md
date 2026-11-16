# dheer05dj/anlp-a3

## Resumen

`dheer05dj/anlp-a3` es un repositorio de checkpoints publicado por Dheeraj Hegde (usuario `dheer05dj`) como entrega de la asignatura ANLP (Assignment 3, convocatoria Monsoon 2026). No es un modelo base entrenado para uso general, sino una coleccion de pesos entrenados especificamente para dos tareas academicas: descifrado de cifrados (cipher decryption) mediante clasificadores token-a-token, y deteccion de noticias falsas con redes neuronales sobre grafos (GNN) en el dataset UPFD-GossipCop.

El repositorio contiene dos familias de artefactos. La primera (`part1/`) incluye cuatro variantes de arquitectura para la tarea de descifrado: transformer, mamba, deltanet e hibrida, cada una empaquetada como un fichero `model.pt` con su `config` y `state_dict`. La segunda (`part2/`) contiene clasificadores GNN para deteccion de fake news combinando cinco arquitecturas (mlp, gcn, sage, gat, bigcn), cuatro conjuntos de caracteristicas (profile, spacy, bert, content) y cinco semillas (0-4).

Es relevante unicamente como material de referencia o reproduccion de resultados academicos: el repositorio tiene 0 descargas y 0 likes, un tamano de 0.0 GB y no declara pipeline ni idiomas soportados. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer, Mamba, DeltaNet e hibrida (parte 1); GNN: MLP, GCN, GraphSAGE, GAT, BiGCN (parte 2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `model.pt`, sin versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model.pt` con diccionarios `config` y `state_dict`) |

## Arquitectura y entrenamiento

La parte 1 agrupa clasificadores token-a-token para descifrado de cifrados, con cuatro variantes arquitectonicas: transformer, mamba (modelo de espacio de estados), deltanet (atencion lineal con regla delta) e hibrida. Cada checkpoint incluye la configuracion y el `state_dict`, lo que permite reconstruir el modelo con el codigo del repositorio de la asignatura (`scripts/part1/test_assn.sh`).

La parte 2 contiene clasificadores GNN de fake news entrenados sobre UPFD-GossipCop, combinando cinco arquitecturas (MLP, GCN, GraphSAGE, GAT y BiGCN) con cuatro representaciones de caracteristicas (profile, spacy, bert, content) y cinco semillas (0-4), lo que da lugar a 100 combinaciones de checkpoint. No se detalla en la model card el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF/DPO. No se documentan innovaciones tecnicas adicionales mas alla de la propia comparativa entre arquitecturas.

## Capacidades

- Clasificacion token-a-token para descifrado de cifrados (parte 1).
- Comparativa empirica entre transformer, Mamba, DeltaNet e hibrida en una tarea de descifrado.
- Clasificacion de nodos/grafos para deteccion de noticias falsas sobre UPFD-GossipCop (parte 2).
- Soporte de multiples representaciones de caracteristicas: profile, spacy, bert y content.
- Reproducibilidad mediante cinco semillas por combinacion modelo/caracteristica.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues.
- No se documenta modo thinking ni capacidades generativas de proposito general.

## Casos de uso

- Reproduccion de resultados academicos: ejecutar `scripts/part1/test_assn.sh` y `scripts/part2/test_gnn.sh` para regenerar las metricas del Assignment 3 de ANLP.
- Estudio comparativo de arquitecturas de secuencia: usar los cuatro checkpoints de la parte 1 para contrastar transformer, Mamba, DeltaNet e hibrida en una misma tarea de descifrado token-a-token.
- Benchmark de GNN para deteccion de fake news: emplear los checkpoints de la parte 2 como linea base sobre UPFD-GossipCop con distintas caracteristicas (profile, spacy, bert, content).
- Analisis de sensibilidad a la semilla: las cinco semillas por combinacion permiten estimar varianza de resultados en los clasificadores GNN.
- Docencia y practicas: material de referencia para asignaturas de procesamiento de lenguaje natural que cubran modelos de espacio de estados y GNN.
- Prototipado de investigacion en descifrado: punto de partida para experimentar con clasificadores token-a-token sobre cifrados, siempre que se disponga del pipeline de datos original.
- No es adecuado para despliegue en produccion, atencion al cliente, generacion de codigo ni tareas generativas: no se documentan esas capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se documenta el tamano de los checkpoints; el repo completo ocupa 0.0 GB).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; los pesos son ficheros `model.pt` de PyTorch que requieren el codigo de la asignatura para cargarse.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dheer05dj/anlp-a3 | no disponible | no disponible | Descifrado y GNN fake news (academico) | MIT | Hugging Face, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Repositorio academico sin mantenimiento declarado ni descargas; no hay evidencia de uso en produccion.
- No se documentan sesgos conocidos, pero al entrenarse sobre UPFD-GossipCop los clasificadores GNN heredan los sesgos del dataset.
- Riesgo de alucinacion no aplicable en sentido estricto (no es un modelo generativo de proposito general), pero los clasificadores pueden producir falsos positivos/negativos en deteccion de fake news.
- No se documentan idiomas soportados; la tarea de descifrado y el dataset UPFD-GossipCop estan en ingles.
- Licencia MIT permite uso comercial, pero la ausencia de documentacion sobre datos de entrenamiento y evaluacion limita su uso responsable en produccion.
- Los checkpoints dependen del codigo del repositorio de la asignatura para cargarse; no hay `config.json` estandar de Hugging Face ni integracion con `transformers`.
- No hay informacion sobre longitud de contexto, tokenizador ni preprocesamiento, lo que impide reutilizarlos fuera del pipeline original.

## Enlaces

- Hugging Face: https://huggingface.co/dheer05dj/anlp-a3
- Repositorio de la asignatura (referenciado en la model card, ruta `scripts/part1/test_assn.sh` y `scripts/part2/test_gnn.sh`): no disponible como URL publica en la informacion proporcionada.
- Dataset UPFD-GossipCop: no disponible como URL en la informacion proporcionada.
- Paper de referencia sobre UPFD: no disponible en la informacion proporcionada.
