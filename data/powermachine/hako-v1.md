# PowerMachine/HAKO-v1

## Resumen

HAKO-v1 es un modelo de lenguaje presentado por el usuario PowerMachine en HuggingFace, descrito como un "orquestador híbrido de atención" que combina múltiples mecanismos: mapas autoorganizados de Kohonen (GHSOM, CPNN, BKN, DASOM), atención cruzada tipo MoE, razonamiento con GNN en árbol, recursión encadenada con fusión beta, una capa generativa basada en difusión y un orquestador de pensamiento cíclico. El modelo se construye sobre dos fuentes congeladas y cuantizadas: AMD Qwen2.5-0.5B en formato int4 ONNX y AMD granite-4.0-1b en AWQ grp32 ONNX, cuyos pesos se descomponen en componentes internos.

El repositorio tiene un tamaño de 0.1 GB, lo que sugiere un modelo de dimensiones reducidas, pero no se publican datos concretos sobre número de parámetros, contexto, licencia o idiomas. La model card incluye una descripción matemática extensa y un conjunto de pruebas numéricas, pero carece de información práctica para su evaluación. No se han encontrado resultados de benchmarks ni documentación adicional fuera de la propia ficha de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema híbrido: GHSOM + CPNN + BKN + DASOM (núcleo Kohonen), MoE cross-attention, Tree-GNN, recursión encadenada, capa generativa de difusión, orquestador cíclico y autoajuste con control de Lyapunov |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (fuente Qwen2.5-0.5B), AWQ grp32 (fuente granite-4.0-1b) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (fuentes congeladas), pesos descompuestos en int4_proto, int4_xi, claves experto K y adaptadores |

## Arquitectura y entrenamiento

La model card describe un sistema complejo que integra múltiples paradigmas: un núcleo basado en mapas autoorganizados de Kohonen (GHSOM, CPNN, BKN, DASOM), atención cruzada con mezcla de expertos (MoE), razonamiento con redes neuronales de grafos en árbol, recursión encadenada con fusión beta, una capa generativa mediante difusión (DDPM) con currículo de juego, y un orquestador de pensamiento cíclico de cuatro pasos. El entrenamiento se organiza en fases (phase 0-4) y está precedido por una batería de 15 comprobaciones numéricas de propiedades matemáticas.

Los pesos provienen de dos modelos base congelados y cuantizados: Qwen2.5-0.5B en int4 y granite-4.0-1b en AWQ, cuyos pesos se descomponen en componentes internos (int4_proto, int4_xi, claves de experto K y cuatro adaptadores por fuente). No se especifican datos sobre el corpus de entrenamiento, número de tokens, ni si se aplicaron técnicas como RLHF o DPO. La model card menciona un presupuesto de ejecución de aproximadamente una hora para el pipeline completo, lo que sugiere un entrenamiento ligero, pero no se ofrecen detalles adicionales.

## Capacidades

- Generación de texto y razonamiento multi-paso mediante el orquestador cíclico de pensamiento.
- Razonamiento estructurado con GNN en árbol y recursión encadenada con fusión beta.
- Capa generativa basada en difusión (DDPM) con currículo de juego.
- Enrutamiento dinámico de expertos mediante REINFORCE y Gumbel-Softmax.
- Autoajuste continuo con control de Lyapunov, Robbins-Monro, EWC-QAC y otros mecanismos.
- No se documentan capacidades específicas de tool calling, visión, audio o multilingüismo.

## Casos de uso

No se han documentado casos de uso concretos en la información disponible. Dada la arquitectura experimental y el tamaño reducido del modelo, su aplicación práctica es incierta. Podría explorarse en entornos de investigación para validar los mecanismos híbridos propuestos, pero no hay evidencia de rendimiento en tareas reales. Se recomienda tratar este modelo como una prueba de concepto académica y no como una herramienta lista para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, y no se han encontrado evaluaciones externas.

## Requisitos de hardware

- Tamaño del repositorio: 0.1 GB, lo que sugiere un modelo ligero.
- Al estar basado en fuentes de 0.5B y 1B cuantizadas, es probable que quepa en GPUs de consumo (p. ej., RTX 3060 o superiores), pero no se dispone de datos oficiales de VRAM.
- No se especifican opciones de despliegue (vLLM, llama.cpp, etc.) ni latencia o throughput.
- El pipeline de entrenamiento requiere aproximadamente 1 hora de ejecución, pero los requisitos de hardware para inferencia no están documentados.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo combina arquitecturas poco convencionales y no se conocen alternativas directas con las mismas características. Los modelos base subyacentes (Qwen2.5-0.5B y granite-4.0-1b) podrían servir como referencia de tamaño, pero HAKO-v1 no publica métricas que permitan comparar su rendimiento.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que no se garantiza el uso comercial ni la redistribución.
- No se documentan sesgos conocidos, pero al derivar de modelos pequeños y con entrenamiento limitado, es probable que presente alucinaciones frecuentes y razonamiento inconsistente.
- La arquitectura es extremadamente compleja y no se ha validado en tareas estándar; su robustez en producción es desconocida.
- El tamaño reducido (0.1 GB) limita su capacidad de modelado de lenguaje en comparación con modelos de mayor escala.
- No se especifican idiomas soportados; probablemente el modelo solo funcione razonablemente en inglés, dado el origen de los modelos base.
- La model card incluye afirmaciones matemáticas extensas, pero no se ha verificado su implementación real más allá de las pruebas numéricas internas.

## Enlaces

- [HuggingFace: PowerMachine/HAKO-v1](https://huggingface.co/PowerMachine/HAKO-v1)
- No se han encontrado papers, repositorios oficiales o demos adicionales. Los resultados de búsqueda web sobre "hako" corresponden a proyectos no relacionados (un runner de agentes y un editor de código).
