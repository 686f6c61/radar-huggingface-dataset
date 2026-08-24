# anonboltzinterp/Boltz1-SAEs-L2-rec1

## Resumen

Boltz1-SAEs-L2-rec1 es un conjunto de sparse autoencoders (SAEs) TopK entrenados sobre las activaciones del trunk Pairformer de Boltz-1, un modelo de predicción de estructura de proteínas. El repositorio, publicado por el usuario anónimo `anonboltzinterp` para una revisión doble ciego, contiene 75 ejecuciones independientes (25 capas × 3 semillas) que cubren las capas pares 0-46 y la capa 47 del trunk, muestreadas en la iteración de reciclaje 1. Su propósito es facilitar el análisis de interpretabilidad mecanicista: identificar qué características biológicas codifica internamente el modelo durante el plegamiento.

Cada SAE tiene una anchura latente de 2048, una entrada de 384 dimensiones y un k de 256, entrenado durante 500 000 pasos con regularización L2 de 3e-3 y preprocesamiento de resta de la media del conjunto de entrenamiento. El repositorio incluye los checkpoints, configuraciones, vectores de media y métricas de evaluación por capa y semilla. Es un recurso especializado para investigadores que estudian la representación interna de modelos de estructura de proteínas, no un modelo generativo de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder TopK (k=256) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch checkpoint (.pt), numpy (.npy), JSON |

## Arquitectura y entrenamiento

Los SAEs se entrenan sobre las activaciones del trunk Pairformer de Boltz-1, específicamente en la iteración de reciclaje 1. Cada SAE es un codificador TopK con 2048 latentes y una entrada de 384 dimensiones, con decoder unit-normalizado y regularización L2 de 3e-3. El preprocesamiento consiste en restar la media del conjunto de entrenamiento (`mean_vector.npy`) antes de la codificación; omitir este paso degrada la reconstrucción. Se entrenaron 500 000 pasos por ejecución, con 3 semillas distintas por capa, lo que da un total de 75 ejecuciones (25 capas × 3 semillas). No se especifican los datos de entrenamiento más allá de que son activaciones del modelo base Boltz-1, ni se detalla el proceso de selección de capas (solo se incluyen índices pares y la capa 47).

## Capacidades

- Reconstrucción de activaciones del trunk Pairformer de Boltz-1 en reciclaje 1, permitiendo medir la fidelidad de la representación.
- Extracción de características interpretables (latentes) que pueden correlacionarse con propiedades biológicas o estructurales de las proteínas.
- Análisis de la evolución de las representaciones entre reciclajes (comparando con el repositorio rec0).
- Soporte para estudios de interpretabilidad mecanicista mediante el análisis de los latentes activos (archivo `alive_cross_seed.json`).
- No es un modelo generativo: no genera texto, código, ni realiza razonamiento; su función es puramente analítica.
- No dispone de tool calling, capacidades multilingües ni soporte para agentes.

## Casos de uso

- Investigación en interpretabilidad de modelos de estructura de proteínas: los SAEs permiten descomponer las activaciones del trunk en características discretas, facilitando la identificación de qué información biológica (por ejemplo, contactos entre residuos, motivos estructurales) se codifica en cada capa.
- Comparación de representaciones entre reciclajes: al existir un repositorio gemelo para reciclaje 0, se puede estudiar cómo cambia la codificación interna a lo largo de las iteraciones de refinamiento.
- Validación de hipótesis sobre mecanismos de plegamiento: los latentes activos pueden correlacionarse con anotaciones biológicas externas (dominios, sitios activos) para generar hipótesis comprobables.
- Desarrollo de métodos de probing: las reconstrucciones de los SAEs sirven como baseline para evaluar la calidad de otras técnicas de análisis de activaciones.
- Entrenamiento de SAEs en otros modelos: la configuración y los hiperparámetros documentados en `config.json` pueden replicarse para entrenar SAEs en arquitecturas similares.
- Auditoría de sesgos o artefactos: al examinar qué características se activan en diferentes tipos de proteínas, se pueden detectar posibles sesgos en el modelo base Boltz-1.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se proporcionan requisitos específicos de VRAM ni GPU recomendadas en la documentación.
- El tamaño total del repositorio es de 1.4 GB, lo que sugiere que cada checkpoint individual es pequeño (probablemente del orden de decenas de MB), por lo que la inferencia de un solo SAE es ligera y puede ejecutarse en cualquier GPU moderna, incluso en CPU.
- No se indican opciones de despliegue específicas (vLLM, llama.cpp, etc.); al ser checkpoints de PyTorch, se cargan directamente con `torch.load` o mediante `huggingface_hub`.
- No hay datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Los repositorios complementarios (`Boltz1-SAEs-L2-rec0` y `Boltz1-SAEs-L2-Diffusion`) son variaciones del mismo proyecto, no alternativas independientes.

## Limitaciones y advertencias

- El repositorio se publicó para revisión anónima doble ciego; no se adjunta autoría ni afiliación, lo que dificulta la atribución de responsabilidad o la solicitud de soporte.
- La licencia no está especificada, por lo que el uso comercial o la redistribución requieren precaución y posible contacto con el autor.
- Los SAEs solo cubren las capas pares (0-46) y la capa 47 del trunk; las capas impares no están incluidas, lo que limita el análisis completo de la arquitectura.
- Es obligatorio restar el vector de media (`mean_vector.npy`) antes de codificar; no hacerlo degrada significativamente la reconstrucción.
- No se proporcionan métricas de rendimiento ni benchmarks, por lo que no se puede evaluar la calidad de los SAEs frente a otros métodos.
- Al ser un recurso de interpretabilidad, no es adecuado para tareas de generación o predicción directa; su uso requiere un conocimiento profundo de Boltz-1 y de SAEs.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anonboltzinterp/Boltz1-SAEs-L2-rec1
- Repositorio espejo (evolve-away): https://huggingface.co/evolve-away/Boltz1-SAEs-L2-rec1
- Colección de SAEs de Boltz: https://huggingface.co/collections/evolve-away/boltz-saes
- Repositorio oficial de Boltz en GitHub: https://github.com/jwohlwend/boltz
- Sitio web de Boltz: https://boltz.bio/
