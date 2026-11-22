# hyukudan/Nemotron-3.5-Bolt-E4B-MTP-Drafter

## Resumen

Nemotron-3.5-Bolt-E4B-MTP-Drafter es un modelo "drafter" (borrador) para decodificacion especulativa, es decir, un modelo auxiliar pequeno que propone los siguientes tokens y deja que el modelo principal los verifique. Lo publica el usuario hyukudan sobre la base del asistente MTP de Google (google/gemma-4-E4B-it-assistant) afinado sobre las salidas de NVIDIA Nemotron 3.5 Bolt E4B. No es un modelo conversacional autonomo: su unica funcion es acelerar la inferencia del modelo principal sin alterar ni un solo token de la salida.

Con 78.779.908 parametros (unos 78,8 M) y apenas 0,2 GB de pesos en safetensors, es dos ordenes de magnitud mas pequeno que el modelo que acelera. La arquitectura es la del asistente MTP de Gemma 4: cuatro capas de anchura 256 y una cabeza de vocabulario completo agrupada en 2.048 centroides, que lee el ultimo estado oculto y la cache KV del modelo principal. Al compartir Nemotron 3.5 Bolt E4B el tokenizador de Gemma-4-E4B-it, el asistente base ya encaja sin cambios.

Su relevancia es practica: en el motor strix-halo-engine-lab sobre una AMD Strix Halo logra 91,9 tok/s frente a 51,8 tok/s sin drafter (x1,78) en el perfil `default` con pesos Q4_K_M oficiales, y hasta x2,05 en el perfil `quality` con EXL3. El afinado sobre salidas de Nemotron aporta una mejora modesta pero medible (de 3,61 a 3,65 tokens esperados por ciclo en ingles). La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Asistente MTP de Gemma 4 (4 capas, anchura 256, cabeza de vocabulario agrupada con 2.048 centroides) para decodificacion especulativa |
| Parametros totales | 78.779.908 (78,8 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo principal y del motor) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors (el modelo principal usa Q4_K_M o EXL3 M4) |
| Idiomas soportados | en, es, ja, zh, fr, de, it, pt |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (layout `drafter-mtp/` del motor, con SHA256SUMS) |

## Arquitectura y entrenamiento

El drafter reproduce la arquitectura del asistente MTP de Gemma 4: una red de cuatro capas de anchura 256 que consume el ultimo estado oculto y la cache KV del modelo principal y emite propuestas de tokens, con una cabeza de vocabulario completo agrupada en 2.048 centroides para abaratar el calculo. Al ser Nemotron 3.5 Bolt E4B un post-entrenamiento de Gemma-4-E4B-it que conserva su tokenizador, el asistente base de Google funciona directamente sin adaptacion de embeddings.

El entrenamiento consiste en un fine-tuning del asistente oficial de Google sobre las propias salidas de Nemotron 3.5 Bolt E4B. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La innovacion tecnica es la combinacion de esta arquitectura MTP con la decodificacion especulativa exacta del motor: el modelo principal verifica cada propuesta, de modo que los ids de tokens generados son identicos con y sin drafter. El afinado aporta aproximadamente +1,5 % de tokens esperados por ciclo en un conjunto reservado (ingles de 3,61 a 3,65; japones de 2,52 a 2,60) y, con la ventana de confianza del motor, un +1,4 % de velocidad frente al asistente sin afinar.

## Capacidades

- Propuesta de tokens para decodificacion especulativa: genera los siguientes tokens candidatos que el modelo principal valida en un solo paso de verificacion.
- Aceleracion de inferencia sin cambio de salida: los ids de tokens son identicos con el drafter activado y desactivado.
- Soporte multilingue en la propuesta: en, es, ja, zh, fr, de, it y pt, con umbrales de confianza ajustados por idioma.
- Rendimiento especialmente bueno en codigo: 3,46 tokens por paso en prompts de codigo frente a 2,10 en espanol y 2,39 en ingles.
- Integracion con la ventana de confianza del motor: el drafter solo propone cuando su coste medido compensa, lo que permite uso concurrente.
- No es un modelo de chat ni de razonamiento autonomo: no responde prompts por si mismo, no soporta tool calling ni agentes y no tiene modo de pensamiento.

## Casos de uso

- Servicio de chat de baja latencia sobre Nemotron 3.5 Bolt E4B: colocar el drafter en `MODEL_DIR/drafter-mtp` y arrancar el motor con el perfil `default` eleva el decode de 51,8 a 91,9 tok/s en una sola peticion, lo que reduce a la mitad el tiempo de respuesta percibido.
- Edicion de codigo asistida en el IDE: en un prompt de agente con un archivo de 2,2K tokens y una peticion de edicion, el drafter alcanza 149,0 tok/s frente a 48,0 sin el, adecuado para autocompletado y refactorizaciones interactivas.
- Despliegue en hardware de consumo o integrado: con 0,2 GB de pesos, el drafter cabe junto al modelo principal en una sola AMD Strix Halo de 128 GB sin presion adicional de memoria.
- Servidores con concurrencia moderada: con 4 peticiones simultaneas el drafter solo propone donde su coste compensa y logra 137,1 tok/s agregados frente a 130,4 sin el, manteniendo la salida identica.
- Evaluacion y benchmarking de motores de inferencia: sirve como referencia reproducible para medir el efecto de la decodificacion especulativa MTP frente a drafters DFlash de mayor tamano.
- Pipelines de generacion por lotes con requisito de determinismo: al garantizar tokens identicos a la decodificacion sin drafter, puede activarse en produccion sin revalidar las salidas del modelo principal.
- Sustitucion de drafters mas costosos: frente al DFlash oficial de NVIDIA (360 M parametros, unos 10 ms por paso de borrador), este drafter cuesta aproximadamente 1 ms por paso y ofrece mayor aceleracion (x1,60-2,18 frente a x1,12-1,41).

## Benchmarks y rendimiento

Velocidad de decode en una AMD Strix Halo (Ryzen AI Max+ 395, Radeon 8060S gfx1151, 128 GB), decodificacion greedy, 256 tokens, tres rondas intercaladas, lookup de prompt desactivado:

| Perfil (pesos) | Drafter on (tok/s) | Drafter off (tok/s) | Aceleracion |
|---|---:|---:|---:|
| `default` (Q4_K_M oficial) | 91,9 | 51,8 | x1,78 |
| `fast` (Q4_K_M, activaciones int8) | 99,3 | 50,5 | x1,97 |
| `quality` (EXL3 M4) | 96,4 | 47,1 | x2,05 |
| Referencia: llama.cpp `74a4fb00`, Q4_K_M | 55,5 (decode simple) | | |

Comparativa de drafters (mismo motor y maquina, Q4_K_M oficial, perfil `default`, una peticion, 256 tokens):

| Prompt | Este drafter: tokens/paso | tok/s | Asistente de Google sin afinar: tokens/paso | tok/s | DFlash oficial de NVIDIA: tokens/paso | tok/s | Sin drafting: tok/s |
|---|---:|---:|---:|---:|---:|---:|---:|
| Ingles | 2,39 | 93,8 | 2,59 | 97,6 | 2,21 | 69,0 | 52,1 |
| Espanol | 2,10 | 86,7 | 2,10 | 83,4 | 1,55 | 58,5 | 52,0 |
| Japones | 2,13 | 85,9 | 2,19 | 85,0 | 1,56 | 59,9 | 52,0 |
| Codigo | 3,46 | 113,3 | 3,32 | 108,1 | 2,15 | 73,6 | 52,0 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el drafter no altera la salida del modelo principal.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,2 GB para los pesos en safetensors, mas la cache KV y el estado oculto que comparte con el modelo principal.
- GPU recomendadas: el motor de referencia esta medido en una AMD Strix Halo (Ryzen AI Max+ 395, Radeon 8060S gfx1151) con 128 GB de memoria unificada; no se documentan mediciones en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, por tamano (78,8 M parametros), siempre que el motor soporte el modelo principal Nemotron 3.5 Bolt E4B en la misma GPU.
- Opciones de despliegue: motor strix-halo-engine-lab (`strix-gemma4-serve`), con el drafter en `drafter-mtp/` o via `--draft-mtp DIR`; se desactiva con `--draft off` o `STRIX_G4_DRAFT=0`. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 91,9 tok/s en `default` a una peticion, 149,0 tok/s en prompt de edicion de codigo, 137,1 tok/s agregados con 4 peticiones concurrentes; coste de cada paso de borrador de aproximadamente 1 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Tokens/paso (ingles) | Aceleracion | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| hyukudan/Nemotron-3.5-Bolt-E4B-MTP-Drafter | 78,8 M | MTP, safetensors | 2,39 | x1,60-2,18 | Apache 2.0 | Hugging Face |
| google/gemma-4-E4B-it-assistant | 78,8 M | MTP, sin afinar | 2,59 | similar | no disponible | Hugging Face |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash | 360 M | DFlash, BF16 GGUF | 2,21 | x1,12-1,41 | no disponible | Hugging Face |

El asistente de Google sin afinar rinde practicamente igual en este motor (algo mejor en ingles, algo peor en espanol, japones y codigo); el DFlash de NVIDIA obtiene mas tokens por paso en ingles pero cada paso de borrador le cuesta unos 10 ms frente a 1 ms del MTP, por lo que su aceleracion final es menor.

## Limitaciones y advertencias

- No es un modelo autonomo: no puede usarse para generar texto, razonar ni responder prompts sin el modelo principal Nemotron 3.5 Bolt E4B y un motor compatible.
- Dependencia estricta del motor: las instrucciones de uso y las mediciones corresponden a strix-halo-engine-lab; no se documenta compatibilidad con otras pilas de inferencia.
- Dependencia del tokenizador: solo es valido con modelos que compartan el tokenizador de Gemma-4-E4B-it, como Nemotron 3.5 Bolt E4B.
- Beneficio marginal del afinado: la mejora sobre el asistente de Google es de aproximadamente +1,5 % en tokens esperados por ciclo, dentro de la variabilidad de una unica sesion de medida.
- Mediciones limitadas: todas las cifras proceden de una sola maquina (AMD Strix Halo) y de una unica sesion por tabla; no hay datos en GPU NVIDIA ni en otros perfiles de cuantizacion.
- Riesgo de alucinacion: no aplica a la salida final, porque el modelo principal verifica cada token y los ids son identicos con y sin drafter; el riesgo reside en el modelo principal.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el modelo principal pueden tener condiciones propias que deben revisarse por separado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/hyukudan/Nemotron-3.5-Bolt-E4B-MTP-Drafter)
- [Modelo base: google/gemma-4-E4B-it-assistant](https://huggingface.co/google/gemma-4-E4B-it-assistant)
- [Modelo principal: NVIDIA-Nemotron-3.5-Bolt-E4B-BF16](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16)
- [Drafter DFlash oficial de NVIDIA](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash)
- [Pack EXL3 M4 de Nemotron 3.5 Bolt E4B](https://huggingface.co/hyukudan/Nemotron-3.5-Bolt-E4B-EXL3)
- [Repositorio del motor strix-halo-engine-lab](https://github.com/hyukudan/strix-halo-engine-lab)
- [Guia del modelo en el motor](https://github.com/hyukudan/strix-halo-engine-lab/blob/main/docs/models/nemotron-3.5-bolt-e4b/README.md)
