# bubskee/llama-3.1-8b-instruct-r-jpp-lenses

## Resumen

`bubskee/llama-3.1-8b-instruct-r-jpp-lenses` no es un modelo de lenguaje nuevo, sino un artefacto de interpretabilidad mecánica publicado sobre `meta-llama/Llama-3.1-8B-Instruct`. Contiene mapas fijos (matrices de transporte) que proyectan las activaciones residuales de las 31 capas no finales del decoder (salidas de bloque 0–30, anchura 4096) al espacio de coordenadas de la salida del bloque 31, antes del RMSNorm final. Sobre esas proyecciones se aplica la cabeza de vocabulario nativa de Llama para leer qué tokens se alinean con una activación interna dada.

El autor, bubskee, publica dos conjuntos de lentes: **R** (ajuste mediante reglas de propagación de relevancia en el backward pass) y **J++** (mezcla firmada de ocho expertos R agrupados por clústeres de activación, con matrices fijas en la release). Se acompañan de un lector de prompts, vectores y neuronas (`read_lenses.py`), evaluaciones de readout congeladas y utilidades de exportación a Neuronpedia. El trabajo está financiado por BlueDot Impact y se apoya en los métodos J-lens y workspace representations publicados por Transformer Circuits.

La relevancia es acotada pero específica: para investigadores que analizan circuitos y neuronas en Llama 3.1 8B Instruct, estas lentes mejoran la fidelidad del readout en capas tempranas e intermedias respecto al logit lens y a la lente J existente de Neuronpedia, con un coste de cómputo de ajuste bajo (64 prompts frente a los 461 del baseline J). No sustituye al modelo base ni modifica sus pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3.1: GQA, RoPE, SwiGLU, RMSNorm); artefacto de lentes de interpretabilidad sobre ella |
| Parametros totales | 8,03 mil millones (modelo base); las lentes son matrices de 4096×4096 por capa |
| Parametros activos | no disponible (no es MoE; los "expertos" de J++ son clústeres de activación, no componentes MoE nativos) |
| Longitud de contexto | 131.072 tokens en el modelo base; el lector impone un límite de prompt de 512 tokens |
| Tipos de cuantizacion | no disponible; el autor indica que la compatibilidad con modelos base cuantizados no está establecida |
| Idiomas soportados | no disponible (el modelo base soporta 8 idiomas oficiales: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (BF16 modelo nativo, FP32 mapas y cabeza de readout); repositorio PyTorch de 4,2 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Llama 3.1 8B Instruct con su decoder transformer estándar: atención con grouped-query attention, RoPE con los parámetros de Llama 3.1 y MLP denso con activación SwiGLU. Sobre él, las lentes se construyen como mapas lineales fijos que transportan el residual crudo `h @ J.T`, sin whitening ni normalización de entrada, desde la salida de cada bloque 0–30 hasta la salida del bloque 31 antes del RMSNorm final. El readout aplica después el RMSNorm nativo en FP32 con su ganancia aprendida y la cabeza de vocabulario nativa con el escalado de logits configurado.

El ajuste de R emplea reglas de propagación de relevancia en el backward pass para estimar el mapa; J++ aprende una mezcla firmada de ocho expertos R agrupados por clústeres de activación. Los ajustes nuevos usan 64 prompts, frente a los 461 del baseline J de Neuronpedia, por lo que la comparación publicada es de presupuesto desigual y no un experimento emparejado J/R/J++ (los pesos J originales no se redistribuyen; su procedencia, revisión inmutable y hash están en `provenance/baseline.json`). El conjunto de evaluación contiene 281 prompts y 416 pares prompt/concepto, disjuntos de 68 prompts de calibración, y las pruebas de checkpoint nativo verifican muestras de parámetros y coincidencia exacta del forward con las reglas R instaladas. Los pesos del modelo base no se actualizan en ningún momento.

## Capacidades

- Lectura de activaciones internas: dado un prompt, un vector de activación de forma `[4096]` o una neurona concreta, devuelve los tokens del vocabulario más alineados según logit lens, R y J++.
- Lectura de neuronas: proyecta la dirección de escritura residual del canal denso del MLP (antes de `down_proj`) a través de cada lente y muestra ambos signos.
- Lectura de vectores arbitrarios: acepta un vector finito no nulo llamado `activation` en safetensors, con el mismo formato que produce `--save-activation`.
- Interfaz Python: expone `WorkspaceLenses.capture`, `transport`, `logits`, `read` y `neuron_direction`.
- Exportación a Neuronpedia: convierte cualquiera de los dos conjuntos de mapas al payload legado con forma de J-lens sin alterar las matrices.
- Ranking filtrado: por defecto aplica el filtro upstream guardado para tokens sin letras ni dígitos, preservando los tokens candidatos de evaluación.
- Cobertura de capas: 31 capas no finales; la comparación primaria usa las capas fuente 4, 8, 12, 16, 20, 24 y 28.
- No incluye: generación de texto propia, tool calling, agentes, visión, audio ni modo thinking; es un artefacto de análisis, no un modelo desplegable como chat.

## Casos de uso

- Análisis de circuitos en capas tempranas: usar R o J++ sobre las capas 4–12 para inspeccionar qué conceptos son linealmente legibles antes de que el logit lens pierda fidelidad, aprovechando la mejora de top-10 filtrado del 31,1 % (logit lens) al 56,0 % (J++).
- Depuración de neuronas del MLP: pasar `--neuron 1234 --layers 16` para ver la dirección de escritura residual de un canal denso y contrastar la hipótesis de función de esa neurona con intervenciones posteriores.
- Validación cruzada de hipótesis interpretativas: comparar los readouts de R y J++ sobre la misma activación; las discrepancias entre lentes son señal útil para diseñar experimentos causales, según pide explícitamente el autor.
- Auditoría de comportamientos multilingües: la tarea `multilingual` del conjunto de evaluación (58,3 % top-10 filtrado con J++) permite estudiar en qué capas se representa un concepto cuando el prompt está en otro idioma.
- Estudio de robustez a erratas: la tarea `typo` alcanza un 93,5 % de top-10 filtrado con J++, lo que la hace adecuada para analizar cómo el modelo mantiene la representación del concepto pese a perturbaciones superficiales del input.
- Integración en pipelines de interpretabilidad existentes: exportar los mapas a formato Neuronpedia para reutilizar visores y flujos de trabajo ya desplegados en el equipo, sin reentrenar nada.
- Investigación de razonamiento multihop: la tarea `multihop` (79,2 % top-10 filtrado con J++) sirve para localizar en qué capas aparece el concepto final de una cadena de inferencia.

## Benchmarks y rendimiento

Las métricas publicadas son puntuaciones de readout de conceptos, no precisión de respuesta generada. La comparación con la J existente es de presupuesto desigual (64 prompts frente a 461).

| Metrica | Logit lens | J existente | R | J++ |
|---|---:|---:|---:|---:|
| Macro top-1, vocabulario completo | 17,1 % | 16,0 % | 21,2 % | 29,5 % |
| Macro top-10, vocabulario completo | 31,1 % | 41,9 % | 45,1 % | 52,7 % |
| Macro top-1, filtrado | 17,1 % | 17,9 % | 24,1 % | 31,2 % |
| Macro top-10, filtrado | 31,1 % | 45,8 % | 48,9 % | 56,0 % |

Top-10 filtrado por tarea:

| Tarea | Logit lens | J existente | R | J++ |
|---|---:|---:|---:|---:|
| association | 7,8 % | 20,8 % | 19,5 % | 31,2 % |
| multihop | 58,3 % | 81,2 % | 75,0 % | 79,2 % |
| multilingual | 41,7 % | 56,0 % | 53,2 % | 58,3 % |
| poetry | 8,9 % | 7,1 % | 12,5 % | 17,9 % |
| typo | 39,0 % | 63,6 % | 84,4 % | 93,5 % |

## Requisitos de hardware

- VRAM para el modelo base: aproximadamente 16 GB en BF16 para los 8,03 mil millones de parámetros; el repositorio de lentes añade 4,2 GB de mapas en FP32.
- GPU validadas: el autor confirma pruebas en CUDA con las versiones de paquetes fijadas; no se especifica modelo de GPU concreto.
- CPU y MPS: el lector los admite como opciones, pero sin validación independiente del modelo completo según el autor.
- GPU de consumo: no confirmado explícitamente; por tamaño (8B en BF16) cabría en GPUs con 24 GB o más, pero el autor no lo valida ni documenta cuantizaciones compatibles.
- Despliegue: no es un modelo servible con vLLM, TGI, llama.cpp u Ollama en su función de lentes; el uso previsto es el script `read_lenses.py` y la API `WorkspaceLenses` en PyTorch.
- Latencia y throughput: no disponibles.
- Requisito previo: aceptar los términos de acceso de `meta-llama/Llama-3.1-8B-Instruct` y autenticarse en Hugging Face antes de la primera descarga; los pesos base se descargan por separado.

## Comparativa con modelos similares

No hay modelos comparables directos en el sentido habitual (no es un LLM rival). La comparación relevante es entre métodos de lectura de activaciones sobre el mismo modelo base:

| Metodo | Base | Presupuesto de ajuste | Macro top-10 filtrado | Disponibilidad |
|---|---|---:|---:|---|
| Logit lens | Llama 3.1 8B Instruct | n/a (sin ajuste) | 31,1 % | nativa, sin descarga |
| J existente (Neuronpedia) | Llama 3.1 8B Instruct | 461 prompts | 45,8 % | externa, no redistribuida aquí |
| R (este repo) | Llama 3.1 8B Instruct | 64 prompts | 48,9 % | safetensors, licencia llama3.1 |
| J++ (este repo) | Llama 3.1 8B Instruct | 64 prompts | 56,0 % | safetensors, licencia llama3.1 |

## Limitaciones y advertencias

- Los readouts son hipótesis a investigar, no etiquetas causales de neuronas; el propio autor lo subraya.
- La comparación con la J existente es de presupuesto desigual (64 frente a 461 prompts) y no un experimento emparejado; las conclusiones sobre superioridad deben matizarse.
- Compatibilidad con modelos base cuantizados no establecida; usar pesos BF16 nativos.
- CPU y MPS no tienen validación independiente del modelo completo en esta release.
- El lector limita el prompt a 512 tokens y no aplica plantilla de chat; los inputs son prefijos de completado en crudo.
- Los "expertos" de J++ son clústeres de activación, no componentes MoE nativos del modelo; no deben interpretarse como tales.
- Licencia llama3.1: uso comercial sujeto a los términos de la Llama 3.1 Community License, incluidos los requisitos de atribución y las restricciones de la política de uso aceptable.
- Sin descargas ni likes en el momento de la consulta; proyecto experimental de un único autor, sin garantías de mantenimiento.
- Sesgos y riesgo de alucinación: no aplica directamente al artefacto, pero hereda los del modelo base si se usa su cabeza de vocabulario para generar texto, cosa que no es su función.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bubskee/llama-3.1-8b-instruct-r-jpp-lenses
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Artículo original de R-lens (LessWrong): https://www.lesswrong.com/posts/nv8oedrnLXKRzNEL9/r-lens-making-j-lens-more-faithful-on-early-layers
- Artículo original de J++ lens (LessWrong): https://www.lesswrong.com/posts/nc9dHfcB22JdMzGbr/j-lens-jacobian-filtering-enables-more-faithful-workspace
- J-lens y workspace representations (Transformer Circuits): https://transformer-circuits.pub/2026/workspace/index.html
- Perfil del autor: https://huggingface.co/bubskee
- Dataset de referencia: https://huggingface.co/datasets/Salesforce/wikitext
