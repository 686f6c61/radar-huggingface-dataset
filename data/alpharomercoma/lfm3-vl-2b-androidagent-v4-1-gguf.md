# alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.1-GGUF

## Resumen

LFM3-VL-2B-AndroidAgent-v4.1-GGUF es una compilacion en formato GGUF del modelo `LFM3-VL-2B-MobileAgent-Dev-WaitRelabel`, un fine-tune de LiquidAI/LFM3-VL-2B orientado a la actuacion como agente GUI sobre pantallas de Android. Lo publica el usuario `alpharomercoma` (proyecto ExperimentalMachines) empaquetando los pesos que se usaron en sus evaluaciones, de modo que los resultados puedan reproducirse con llama.cpp. El modelo base es un vision-language de 1.728.801.600 parametros (aproximadamente 1,7 mil millones) que procesa capturas de pantalla y genera acciones sobre la interfaz.

El modelo resuelve una tarea muy concreta: dado un objetivo en ingles y una captura de pantalla del dispositivo, decidir el siguiente paso (toque, deslizamiento, entrada de texto o espera) en un bucle de agente movil. La compilacion incluye el modelo de lenguaje cuantizado a 4 bits (Q4_K_M) y el proyector de vision sin tocar en Q8_0, heredado del modelo original de LiquidAI. El contexto de servicio documentado es de 8192 tokens con un maximo de 1024 tokens por imagen.

Es relevante ahora porque ejemplifica el patron de fine-tune pequeno y especializado sobre un VLM compacto para control de dispositivos, empaquetado en GGUF para su ejecucion local con llama.cpp. No obstante, el propio autor lo marca explicitamente como modelo de desarrollo, conservado solo para reproducibilidad y no recomendado para uso general: remite a la version `LFM3-VL-2B-MobileAgent` como alternativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (LFM3-VL-2B de LiquidAI), con torre de vision y proyector multimodal; pesos empaquetados para llama.cpp |
| Parametros totales | 1.728.801.600 (segun safetensors del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens en la configuracion de servicio documentada; maximo de 1024 tokens por imagen |
| Tipos de cuantizacion | Q4_K_M para el modelo de lenguaje; Q8_0 para el proyector de vision (mmproj) |
| Idiomas soportados | Ingles (objetivos y prompts en `en`) |
| Licencia | LFM Open License v1.0 (`lfm1.0`), heredada de LiquidAI/LFM3-VL-2B |
| Formato de pesos | GGUF (dos ficheros: modelo de lenguaje y mmproj) |
| Tamano del repo | 1,3 GB |
| Modelo base | experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-WaitRelabel (a su vez derivado de LiquidAI/LFM3-VL-2B) |
| Pipeline | image-text-to-text |
| Libreria | gguf |
| Herramienta de conversion | llama.cpp `cd959bae9` (`convert_hf_to_gguf.py` a F16 y luego `llama-quantize Q4_K_M`) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de LFM3-VL-2B, un vision-language transformer de aproximadamente 1,7 mil millones de parametros que combina una torre de vision con un modelo de lenguaje y un proyector multimodal. En esta compilacion GGUF el proyector de vision se mantiene en Q8_0 y es identico al de LiquidAI/LFM3-VL-2B-GGUF, ya que el fine-tune no modifico la torre de vision; solo se cuantizo el modelo de lenguaje a Q4_K_M. El proceso de conversion y cuantizacion esta documentado y es reproducible byte a byte con la misma version de llama.cpp.

El entrenamiento del fine-tune se realizo exclusivamente sobre demostraciones grabadas: el modelo nunca interactuo con un telefono real durante el entrenamiento. La tarea modelada es un bucle de agente movil con un objetivo en ingles, una captura de pantalla por paso y un historial de texto de hasta 8 pasos, sin memoria adicional. El nombre del modelo base (`WaitRelabel`) sugiere una reclasificacion de la accion de espera, aunque la model card no detalla el dataset, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO. No se dispone de informacion sobre innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal en esta ficha.

## Capacidades

- Generacion de acciones de agente GUI a partir de capturas de pantalla de Android: toques, deslizamientos, entrada de texto y esperas.
- Comprension de imagen y texto combinados (image-text-to-text) para interpretar el estado de la interfaz.
- Seguimiento de objetivos en ingles a lo largo de un bucle de hasta 8 pasos con historial de texto.
- Formato de razonamiento compatible con `--reasoning-format deepseek` en llama.cpp.
- Inferencia local via llama.cpp con soporte de servidor (`llama-server`) y offload completo a GPU (`-ngl 99`).
- No se documenta soporte de tool calling generico, function calling, audio ni modo thinking mas alla del formato de razonamiento indicado.

## Casos de uso

- Reproduccion de evaluaciones de agentes moviles: el modelo se publica precisamente para replicar los resultados del proyecto ExperimentalMachines con la misma configuracion de llama.cpp, lo que permite auditar sus benchmarks paso a paso.
- Investigacion en control de GUI movil: sirve como punto de partida para estudiar como un VLM de 1,7 mil millones de parametros interpreta capturas y decide acciones, con un coste computacional bajo.
- Pruebas de pipelines de agente en local: al ejecutarse con llama.cpp y caber en hardware modesto, permite montar entornos de prueba de agentes Android sin depender de APIs externas.
- Generacion de datos sinteticos de interaccion: el modelo puede etiquetar capturas con acciones candidatas para construir datasets de entrenamiento de agentes, siempre bajo supervision.
- Comparacion de tecnicas de cuantizacion: al existir versiones Q4_K_M y el proyector Q8_0, permite medir el impacto de la cuantizacion en tareas de percepcion visual y decision secuencial.
- Docencia y demostraciones: su tamano reducido y su formato GGUF facilitan mostrar en un portatil como funciona un agente visual sobre movil, sin infraestructura de servidor.
- No se recomienda su uso en produccion ni en dispositivos con cuentas reales, segun advierte el propio autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al repositorio del proyecto (`docs/results.md`) para consultar los resultados con su fuente, pero no incluye cifras concretas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de aproximadamente 1,7 mil millones de parametros en Q4_K_M (repo de 1,3 GB), la huella de pesos ronda los 1-1,5 GB; con contexto de 8192 tokens y hasta 1024 tokens por imagen, el consumo total de VRAM se situa previsiblemente en el rango de 2-4 GB, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-6 GB de VRAM deberia poder ejecutarlo con offload completo; GPUs de datacenter como A100 o H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4090 y equivalentes; no se dispone de confirmacion oficial de modelos concretos.
- Opciones de despliegue: llama.cpp mediante `llama-server` con los flags documentados (`-c 8192 --image-max-tokens 1024 --reasoning-format deepseek -np 1 -ngl 99`); al ser GGUF, es compatible con el ecosistema llama.cpp, aunque no se documenta soporte explicito de vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-AndroidAgent-v4.1-GGUF (este) | ~1,7 B | 8192 tokens (1024 por imagen) | Agente GUI Android, fine-tune | LFM Open License v1.0 | GGUF en Hugging Face |
| LiquidAI/LFM3-VL-2B | ~1,7 B | No disponible en esta ficha | VLM generalista base | LFM Open License v1.0 | Pesos originales y GGUF de LiquidAI |
| experimentalmachines/LFM3-VL-2B-MobileAgent | No disponible | No disponible | Version recomendada del agente movil | No disponible | Hugging Face |
| experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-WaitRelabel | No disponible | No disponible | Fine-tune de desarrollo (origen de esta compilacion) | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de desarrollo: el autor lo conserva solo para reproducibilidad y lo marca como no recomendado; remite a `LFM3-VL-2B-MobileAgent` como sustituto.
- Modelo de investigacion: no debe dejarse actuar de forma desatendida en un telefono con cuentas reales, mensajes o pagos.
- Solo acepta objetivos en ingles; no hay soporte multilingue documentado.
- Una sola captura de pantalla por paso y memoria limitada al historial de texto de 8 pasos; sin memoria a largo plazo.
- Entrenado unicamente con demostraciones grabadas; nunca interactuo con un telefono real durante el entrenamiento, lo que puede provocar un desajuste con el estado real del dispositivo.
- Riesgo de alucinacion en la interpretacion de la interfaz y en la eleccion de acciones, no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados.
- Licencia LFM Open License v1.0: es necesario revisar sus terminos antes de cualquier uso comercial, ya que no es una licencia permisiva estandar.
- El proyector de vision no fue reentrenado; las limitaciones de percepcion del modelo base se heredan intactas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.1-GGUF
- Modelo base del fine-tune: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-WaitRelabel
- Version recomendada: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent
- Modelo original de LiquidAI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- GGUF original de LiquidAI: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Documentacion de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
- Guia de nombres: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/naming.md
