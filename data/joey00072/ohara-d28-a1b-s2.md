# joey00072/ohara-d28-a1b-s2

## Resumen

ohara-d28-a1b-s2 es un checkpoint de preentrenamiento de la primera etapa (stage-1) del modelo ohara, una arquitectura hibrida causal encoder-decoder desarrollada por el usuario joey00072. Se trata de un modelo base, no ajustado por instrucciones, con una ventana de contexto de 4k tokens y un diseno que combina atencion con ventana deslizante (SWA), atencion global con puente KV, atencion token-sparse, residuales mHC y memoria de n-gramas. La capa de mezcla de expertos (MoE) emplea 256 expertos con top-8 mas un experto compartido, lo que da lugar a 0,98B parametros activos en la matriz troncal (1,25B incluyendo la cabeza LM) sobre un total de 23,85B parametros.

El modelo se publica como material de investigacion en la libreria propia `ohara` y utiliza el tokenizador de Qwen3. El checkpoint corresponde al paso 3974, con 25.002.246.144 tokens procesados (hito del 25 % del entrenamiento previsto) y una perdida de entrenamiento de 1,8886 nats. Su relevancia actual es la de un artefacto de investigacion abierta sobre arquitecturas hibridas y MoE de gran escala, pensado para estudiar el comportamiento de este tipo de disenos durante el preentrenamiento mas que para uso directo en produccion.

Al ser un checkpoint intermedio de preentrenamiento, no dispone de ajuste por instrucciones, alineamiento ni datos de evaluacion publicados. Cualquier uso practico requeriria un post-entrenamiento adicional (SFT, preferencias) y una evaluacion propia por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido causal encoder-decoder (ohara d28 final_v2): SWA + atencion global con puente KV + atencion token-sparse, residuales mHC, memoria de n-gramas, MoE con 256 expertos top-8 + experto compartido |
| Parametros totales | 23.846.942.486 (23,85B) |
| Parametros activos | 0,98B en la matriz troncal; 1,25B incluyendo la cabeza LM |
| Longitud de contexto | 4.096 tokens (stage-1) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tokenizador Qwen3, multilingue por herencia del tokenizador) |
| Licencia | no disponible |
| Formato de pesos | safetensors (export weights-only) |
| Tokenizador | Qwen3 |
| Etapa | preentrenamiento stage-1, checkpoint del paso 3974 |
| Tokens vistos | 25.002.246.144 (hito 25 %) |
| Perdida de entrenamiento | 1,8886 nats |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ohara en su variante d28 `final_v2`, descrita por el autor como un encoder-decoder causal hibrido. Combina tres mecanismos de atencion: ventana deslizante (SWA), atencion global con puente KV y atencion token-sparse. A ello se suman residuales mHC y un modulo de memoria de n-gramas. La capa MoE contiene 256 expertos con enrutamiento top-8 mas un experto compartido, lo que explica la gran diferencia entre parametros totales (23,85B) y activos (~1B).

El entrenamiento corresponde a la primera etapa con contexto de 4k tokens. En el momento de la publicacion del checkpoint se habian procesado 25.002.246.144 tokens (hito del 25 % del plan), con una perdida de 1,8886 nats en el paso 3974. No se dispone de informacion sobre la composicion del dataset, el uso de RLHF/DPO ni sobre innovaciones adicionales como decodificacion especulativa. El autor mantiene un repositorio de codigo (`joey00072/ohara`) con utilidades de carga y exportacion, y publica tambien el estado de entrenamiento reanudable en un repositorio separado (`ohara-d28-a1b-stage1-state`).

## Capacidades

- Generacion de texto autoregresiva como modelo base de lenguaje; no esta ajustado por instrucciones, por lo que no sigue instrucciones de forma fiable sin post-entrenamiento.
- Razonamiento y conocimiento general derivados del preentrenamiento, sin evaluacion publicada que los cuantifique.
- Capacidad multilingue potencial heredada del tokenizador Qwen3; no se especifican idiomas oficialmente soportados.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, vision ni audio.
- El checkpoint esta pensado para continuar el preentrenamiento o para servir de base a etapas posteriores (SFT, alineamiento).

## Casos de uso

- Investigacion sobre arquitecturas hibridas: el checkpoint permite reproducir y estudiar el comportamiento de la combinacion SWA + atencion global con puente KV + token-sparse en un modelo de 23,85B parametros totales con ~1B activos, comparandolo con transformers densos de coste similar.
- Estudio de MoE a gran escala: con 256 expertos top-8 y experto compartido, sirve para analizar el enrutamiento, el balanceo de carga y el uso efectivo de parametros durante el preentrenamiento.
- Continuacion del preentrenamiento: el checkpoint puede retomarse con el estado reanudable publicado en `ohara-d28-a1b-stage1-state` para extender el entrenamiento mas alla del 25 % o ampliar el contexto mas alla de 4k.
- Base para post-entrenamiento: punto de partida para experimentos de SFT y alineamiento sobre una arquitectura no convencional, evaluando si las ganancias de eficiencia del diseno hibrido se mantienen tras el ajuste.
- Reproducibilidad de pipelines: el codigo de `ohara` y las utilidades `load_hf` permiten integrar el modelo en flujos de investigacion propios y comparar checkpoints entre pasos.
- Analisis de eficiencia computacional: la relacion entre parametros activos (~1B) y totales (23,85B) lo hace util para medir coste de inferencia y memoria frente a modelos densos equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la perdida de entrenamiento de 1,8886 nats en el paso 3974, que no es comparable con metricas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: con 23,85B parametros totales en safetensors de precision completa, el peso ronda los 47,7 GB (tamano del repo); se requiere al menos esa cantidad de memoria para cargar los pesos sin cuantizar.
- Al ser un MoE con ~1B parametros activos, el coste computacional por token es bajo en comparacion con un denso de 23,85B, pero la memoria necesaria para almacenar todos los expertos sigue siendo la de un modelo de ~24B.
- GPU recomendadas: no disponible; por tamano, se necesitarian GPU con 48 GB o mas (A100 80 GB, H100, o configuraciones multi-GPU) para cargar el checkpoint completo.
- GPU de consumo: no cabe en GPU de consumo de 24 GB en precision completa; no se documentan opciones de cuantizacion (GGUF, GPTQ, AWQ) que permitan reducir el requisito.
- Opciones de despliegue: la unica via documentada es la libreria `ohara` del autor (`load_hf`), con soporte para `device="cuda"`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ohara-d28-a1b-s2 | 23,85B | ~1B (1,25B con LM head) | 4k | no disponible | Hugging Face (libreria `ohara`) |
| ohara-d28-a1b-stage1 | ~23,4B | ~1,02B | 4k | no disponible | Hugging Face (libreria `ohara`) |
| Modelos MoE densos comparables (p. ej. familia Qwen3 MoE) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos de terceros en la informacion proporcionada que permitan una comparativa cuantitativa fiable. La unica comparacion directa posible es con el checkpoint anterior del mismo autor (`ohara-d28-a1b-stage1`), que presenta un numero de parametros ligeramente inferior y el mismo contexto de 4k.

## Limitaciones y advertencias

- Es un checkpoint de preentrenamiento stage-1, no ajustado por instrucciones: no sigue instrucciones de forma fiable y no debe usarse directamente en produccion sin post-entrenamiento.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo.
- No se ha publicado informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad; el riesgo de alucinacion y de sesgos es desconocido pero esperable en un modelo base.
- Licencia no disponible: no puede asumirse uso comercial permitido; es necesario contactar con el autor o consultar el repositorio antes de cualquier uso productivo.
- Idiomas soportados no documentados; el rendimiento fuera del ingles (o de los idiomas mayoritarios del tokenizador Qwen3) es incierto.
- No se documentan opciones de cuantizacion ni compatibilidad con frameworks de inferencia estandar, lo que limita el despliegue a la libreria propia `ohara`.
- El checkpoint representa solo el 25 % del entrenamiento previsto; su calidad final puede mejorar sustancialmente en etapas posteriores.
- Los checkpoints antiguos se eliminan y solo se conservan los tres mas recientes como ramas `step-NNNNNN`; la reproducibilidad de experimentos pasados puede verse afectada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joey00072/ohara-d28-a1b-s2
- Checkpoint anterior stage-1: https://huggingface.co/joey00072/ohara-d28-a1b-stage1
- Estado de entrenamiento reanudable: https://huggingface.co/joey00072/ohara-d28-a1b-stage1-state
- Repositorio de codigo: https://github.com/joey00072/ohara
