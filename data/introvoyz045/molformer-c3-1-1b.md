# introvoyz045/MoLFormer-c3-1.1B

## Resumen

MoLFormer-c3-1.1B es un modelo de lenguaje quimico enmascarado (masked language model) para representaciones de moleculas, publicado por el usuario introvoyz045 en HuggingFace y descrito en el articulo de ChemBERTa-3. El modelo sigue la estela de la familia MoLFormer y se presenta como un modelo de 1.100 millones de parametros nominales, aunque el repositorio real contiene 46.805.760 parametros en pesos safetensors (0,7 GB), una discrepancia sustancial entre el nombre y el contenido que conviene tener en cuenta.

El modelo se ha preentrenado sobre una combinacion de ZINC20 (1.000 millones de compuestos) y PubChem (100 millones de compuestos), segun la model card, y esta disenado para la tarea de fill-mask sobre secuencias quimicas (SMILES). Su relevancia practica hoy es la de un modelo de fundacion quimica pequeno y de licencia MIT, util para fine-tuning en tareas de quimioinformatica y para experimentacion sin grandes requisitos de computo.

No hay informacion publicada sobre idiomas, contexto maximo, cuantizaciones ni benchmarks en la informacion disponible. El modelo requiere `trust_remote_code=True` (tag `custom_code`) y su tokenizador y pesos se referencian en la model card bajo el identificador `DeepChem/MoLFormer-c3-1.1B`, distinto del repositorio que aloja esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo MoLFormer (masked LM quimico, `custom_code`) |
| Parametros totales | 46.805.760 (segun safetensors); el nombre indica 1.1B, no confirmado |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de secuencias quimicas, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un modelo de la familia MoLFormer, un transformer basado en atencion lineal (linear attention) disenado para secuencias de SMILES, reentrenado en el marco ChemBERTa-3. La model card lo etiqueta como `masked-lm` y `ChemBERTa-3`, y lo describe como preentrenado sobre el 100 % de ZINC20 (1.000 millones de compuestos) y el 100 % de PubChem (100 millones de compuestos).

No se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla de las dos fuentes citadas, ni si hubo fases de RLHF o DPO (poco probables en un masked LM). Tampoco se especifica la configuracion de capas, dimension oculta o cabezas de atencion, ni innovaciones tecnicas adicionales mas alla del uso de atencion lineal propio de MoLFormer.

## Capacidades

- Modelado de lenguaje enmascarado (fill-mask) sobre secuencias quimicas en formato SMILES.
- Generacion de representaciones (embeddings) de moleculas para tareas posteriores de quimioinformatica.
- Fine-tuning para prediccion de propiedades moleculares (solubilidad, toxicidad, actividad biologica) mediante cabezas supervisadas.
- Aprendizaje autosupervisado sobre grandes corpus quimicos (ZINC20 y PubChem).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue de lenguaje natural ni vision, audio o thinking mode.
- Requiere `trust_remote_code=True` por el uso de codigo personalizado (`custom_code`).

## Casos de uso

- Filtrado y priorizacion de librerias quimicas: usar los embeddings del modelo para agrupar y ordenar compuestos candidatos en un pipeline de descubrimiento temprano, aprovechando el preentrenamiento sobre ZINC20 y PubChem.
- Prediccion de propiedades ADMET: hacer fine-tuning de una cabeza de regresion sobre los embeddings para estimar absorcion, distribucion, metabolismo, excrecion y toxicidad antes de sintetizar compuestos.
- Completado de SMILES en herramientas de edicion molecular: emplear la tarea fill-mask para sugerir fragmentos o sustituyentes en una interfaz de quimioinformatica.
- Deteccion de moleculas invalidas o anomalas: puntuar secuencias SMILES con la perdida del masked LM para identificar entradas atipicas en un catalogo.
- Busqueda de similitud quimica: indexar embeddings de un catalogo interno y recuperar los compuestos mas proximos a una consulta, con coste de inferencia bajo dado el tamano real del modelo.
- Prototipado e investigacion en modelos de fundacion quimicos: servir como linea base reproducible (licencia MIT, pesos safetensors) para comparar con otros modelos de ChemBERTa-3 o MoLFormer.
- Extraccion de caracteristicas para modelos downstream: usar las representaciones congeladas como entrada de clasificadores ligeros en tareas de quimica medicinal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 46,8 millones de parametros en fp32, aproximadamente 0,2 GB de pesos; en fp16, unos 0,1 GB. La memoria real dependera del codigo personalizado y del tamano de lote.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4090); tambien funciona en CPU para lotes pequenos.
- Cabe en GPU consumer: si, con amplio margen, incluidas GPUs de gama baja y entornos integrados con suficiente RAM.
- Opciones de despliegue: `transformers` con `AutoModelForMaskedLM` y `trust_remote_code=True`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoLFormer-c3-1.1B (este) | 46,8 M reales (nombre indica 1.1B) | no disponible | fill-mask quimico | MIT | HuggingFace |
| MoLFormer-base (DeepChem) | no disponible en la informacion | no disponible | embeddings quimicos | no disponible en la informacion | HuggingFace |
| ChemBERTa-2 | no disponible en la informacion | no disponible | masked LM quimico | no disponible en la informacion | HuggingFace |
| Modelos de la familia ChemBERTa-3 | no disponible en la informacion | no disponible | masked LM quimico | no disponible en la informacion | HuggingFace |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Discrepancia entre el nombre (1.1B) y los parametros reales en safetensors (46,8 M): verificar el checkpoint antes de usarlo en produccion.
- El identificador de la model card (`DeepChem/MoLFormer-c3-1.1B`) no coincide con el repositorio de esta ficha (`introvoyz045/MoLFormer-c3-1.1B`); el codigo de ejemplo puede no resolver contra este repositorio.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor del modelo; auditar antes de desplegar.
- Modelo especializado en SMILES: no es un modelo de lenguaje natural y no debe usarse para tareas de texto general.
- Riesgo de alucinacion en la generacion de SMILES: las secuencias completadas pueden no corresponder a moleculas quimicamente validas; validar con RDKit u otra herramienta.
- Sesgos derivados del corpus de entrenamiento (ZINC20 y PubChem): puede infrarrepresentar quimica espacial o compuestos poco frecuentes en esas bases.
- No hay informacion publicada sobre sesgos, evaluaciones de seguridad ni limites de contexto.
- Licencia MIT: permite uso comercial, pero conviene conservar el aviso de copyright y revisar las condiciones de los datos de entrenamiento subyacentes.

## Enlaces

- HuggingFace: https://huggingface.co/introvoyz045/MoLFormer-c3-1.1B
- Modelo referenciado en la model card: https://huggingface.co/DeepChem/MoLFormer-c3-1.1B
- Paper de referencia: Singh R, Barsainyan AA, Irfan R, Amorin CJ, He S, Davis T, et al. ChemBERTa-3: An Open Source Training Framework for Chemical Foundation Models. RSC Digital Discovery 2026; doi:10.1039/D5DD00348B
