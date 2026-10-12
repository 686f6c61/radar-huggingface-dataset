# Pre-to-Post-2/sft_200m_generated_fixed_pe

## Resumen

`Pre-to-Post-2/sft_200m_generated_fixed_pe` es un repositorio de HuggingFace que agrupa 25 checkpoints de fine-tuning supervisado (SFT) para interacción multi-turno en el dominio del ajedrez. Está publicado por el usuario Pre-to-Post-2 y su rasgo distintivo es que se trata de la primera tanda de checkpoints entrenada después de corregir un error en la codificación posicional YaRN dentro de `sft_trainer.py` (corrección fechada en septiembre de 2026).

El problema que resuelve es metodológico: antes de la corrección, el cambio de `block_size` / `rope_scaling` se aplicaba después de `from_pretrained()`, de modo que las ejecuciones con contexto de 3072 tokens entrenaban con extrapolación RoPE simple aunque su configuración guardada declarase YaRN. Los checkpoints de este repositorio cargan primero la configuración y construyen el modelo a partir de ella, de forma que entrenamiento e inferencia emplean YaRN de manera consistente (factor 3, de 1024 a 3072 tokens).

La colección cubre tres tamaños de modelo (20M, 50M y 200M parámetros) y varias combinaciones de hiperparámetros denominadas `alpha` y `beta`, todas ellas construidas sobre una base preentrenada de 1024 tokens de contexto. Es relevante ahora como material de referencia para estudiar el escalado de modelos muy pequeños en tareas de razonamiento con Chain-of-Thought, así como para comparar el efecto real de YaRN frente a la extrapolación RoPE en contextos cortos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de solo decodificador (cargable con `AutoModelForCausalLM`); detalles internos no disponibles |
| Parametros totales | Tres familias de checkpoints: 20M, 50M y 200M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 3072 tokens (base preentrenada de 1024 tokens, extendida con YaRN factor 3) |
| Tipos de cuantizacion | No disponible (repositorio en safetensors sin cuantizaciones declaradas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors |
| Libreria | transformers |
| Tamano del repositorio | 8,9 GB (25 checkpoints) |

## Arquitectura y entrenamiento

Los checkpoints siguen una arquitectura transformer de solo decodificador, coherente con la libreria `transformers` y la clase `AutoModelForCausalLM`. Cada modelo vive en la ruta `<model_id>/final/`, donde `model_id` sigue el patron `C{compute}_{size}_alpha{α}_beta{β}`; por ejemplo, `C6p5e18_50m_alpha0.400_beta0.023`. Los valores `compute` observados son `6p5e18` y `6p5e19`, y los tamanos cubiertos son 20M, 50M y 200M de parametros. El repositorio no incluye estados del optimizador, solo el checkpoint final.

El entrenamiento parte de una base preentrenada con 1024 tokens de contexto y la extiende a 3072 mediante YaRN (factor 3). La correccion clave respecto a ejecuciones anteriores consiste en cargar primero la configuracion y construir el modelo desde ella, en lugar de modificar `block_size` / `rope_scaling` despues de `from_pretrained()`. Los datos de SFT corresponden al conjunto `200m_generated`, generado con un modelo `qwen06b` y parametros `nc8/nt10/nta8`, en formato Chain-of-Thought `trajectory_sep_no_labels`, repartidos en 85 ficheros de entrenamiento. La tasa de aprendizaje empleada fue 3e-4 y se conserva unicamente el checkpoint final (paso 771).

## Capacidades

- Generacion de texto autoregresiva multi-turno orientada al dominio del ajedrez.
- Razonamiento explicito mediante Chain-of-Thought, en el formato `trajectory_sep_no_labels`.
- Soporte de contexto extendido de 3072 tokens gracias a YaRN, frente a la ventana base de 1024 tokens.
- Varias configuraciones de hiperparametros (`alpha` y `beta`) que permiten estudiar el efecto del escalado y del ajuste fino en tres tamanos distintos (20M, 50M y 200M).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso fuera del esquema CoT de ajedrez: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales adicionales (vision, audio, thinking mode explicito): no disponibles.

## Casos de uso

- Investigacion sobre razonamiento Chain-of-Thought en dominios acotados: los checkpoints permiten estudiar como se comporta el CoT en un entorno cerrado como el ajedrez, con reglas verificables, y comparar entre tamanos de 20M, 50M y 200M.
- Estudio de destilacion desde un modelo mayor: al haber sido generados con un `qwen06b`, sirven para analizar la calidad de la destilacion de capacidades de razonamiento hacia modelos muy pequenos.
- Evaluacion del efecto real de YaRN frente a RoPE: este repositorio es el caso de control tras la correccion del bug, por lo que resulta adecuado para medir la diferencia entre entrenar con YaRN correctamente aplicado y hacerlo con extrapolacion RoPE simple.
- Punto de partida para RLHF o DPO posterior: al ser checkpoints SFT con un unico paso final, pueden emplearse como inicializacion para etapas de alineamiento adicional en tareas de ajedrez.
- Benchmarking de modelos diminutos: permiten medir el rendimiento de arquitecturas de 20M-200M parametros en tareas de razonamiento estructurado, comparando combinaciones de `alpha` y `beta`.
- Generacion de datos sinteticos o anotaciones de partidas: dado su formato CoT, pueden usarse para producir trayectorias de razonamiento etiquetadas que alimenten otros entrenamientos.
- Transferencia a otros dominios de razonamiento multi-turno: la receta de SFT con CoT y contexto extendido via YaRN es replicable a otros entornos de reglas estrictas.
- Analisis de escalado en contexto corto: la ventana de 3072 tokens es suficiente para estudiar como escalan las capacidades con el numero de parametros sin la complejidad de contextos de decenas de miles de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de ficheros `combined_eval.json` junto a algunos checkpoints (por ejemplo, en las carpetas de los modelos ya evaluados), pero no incluye los valores numericos. Ademas, los checkpoints `C6p5e18_20m_alpha1.000_beta0.008` y `C6p5e18_50m_alpha0.200_beta0.023` fueron reentrenados el 2026-10-05 y aun no disponen de `combined_eval.json`, por lo que su evaluacion tampoco esta disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros, sin cuantizacion declarada en el repositorio):
  - 20M parametros: aproximadamente 80 MB en fp32 y 40 MB en fp16.
  - 50M parametros: aproximadamente 200 MB en fp32 y 100 MB en fp16.
  - 200M parametros: aproximadamente 800 MB en fp32 y 400 MB en fp16.
- GPU recomendadas: no se especifican en la model card. Por tamano, cualquier GPU consumer moderna (por ejemplo, serie RTX 30/40) es mas que suficiente, e incluso la inferencia en CPU resulta viable para los tres tamanos.
- Cabe en GPU consumer: si, en todos los casos. Los modelos de 20M y 50M caben incluso en iGPU o en memoria unificada de equipos de gama baja.
- Opciones de despliegue: al estar en formato safetensors y usar `transformers`, son desplegables con dicha libreria; la compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta declarada en la informacion disponible. El tag `endpoints_compatible` sugiere compatibilidad con los endpoints de HuggingFace Inference.
- Latencia y throughput estimados: no disponibles.
- Espacio en disco: el repositorio completo ocupa 8,9 GB, aunque solo es necesario descargar la subcarpeta del checkpoint concreto que se quiera usar.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia interna dentro del propio repositorio, si pueden contrastarse las tres familias de checkpoints:

| Familia | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sft_200m_generated_fixed_pe (20m) | 20M | 3072 tokens (YaRN) | No disponible | Publico en HuggingFace |
| sft_200m_generated_fixed_pe (50m) | 50M | 3072 tokens (YaRN) | No disponible | Publico en HuggingFace |
| sft_200m_generated_fixed_pe (200m) | 200M | 3072 tokens (YaRN) | No disponible | Publico en HuggingFace |

Comparativa con modelos externos: no disponible.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso para uso comercial ni redistribucion. Es un riesgo legal relevante para cualquier integracion en produccion.
- Idiomas no declarados: no hay informacion sobre que idiomas maneja el modelo fuera del formato de datos de entrenamiento.
- Tamano reducido: los modelos de 20M y 50M parametros tienen una capacidad muy limitada, y el de 200M sigue siendo pequeno en comparacion con modelos de proposito general.
- Dominio restringido: el entrenamiento se limita a ajedrez multi-turno con formato CoT; el rendimiento fuera de ese dominio sera previsiblemente pobre.
- Riesgo de alucinacion: al ser modelos generativos pequenos, pueden producir jugadas ilegales, incoherencias en la trayectoria de razonamiento o texto no valido en el esquema esperado.
- Ventana de contexto limitada: 3072 tokens, suficiente para partidas cortas pero insuficiente para historiales largos.
- Repositorio de investigacion, no un modelo unico: contiene 25 checkpoints con hiperparametros distintos; es necesario elegir la subcarpeta concreta y no existe una version "recomendada" declarada.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones externas conocidas.
- Historial de bug: la correccion de YaRN es reciente, de modo que cualquier comparacion con ejecuciones anteriores debe tener en cuenta que aquellas usaban RoPE simple pese a declarar YaRN en la configuracion.
- Dos checkpoints reentrenados sin evaluacion: `C6p5e18_20m_alpha1.000_beta0.008` y `C6p5e18_50m_alpha0.200_beta0.023` no cuentan con `combined_eval.json`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pre-to-Post-2/sft_200m_generated_fixed_pe
- Los resultados de la busqueda web no contienen enlaces relevantes al modelo: las referencias encontradas (Programme de reussite educative, Preply, Larousse, Service-Public.fr) no guardan relacion con este repositorio.
- No se han proporcionado enlaces adicionales a papers, blogs, repositorios de codigo ni demos en la informacion disponible.
