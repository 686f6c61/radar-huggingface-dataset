# rockerBOO/Krea-2-Turbo-LoRA-Low-Mottle

## Resumen

Krea 2 Turbo LoRA: Low Mottle es un adaptador LoRA de bajo rango (rank 64, bf16) desarrollado por el usuario rockerBOO como reemplazo directo del LoRA turbo oficial de Krea 2. Su proposito es corregir un artefacto concreto del modelo turbo: la aparicion de ruido moteado (mottle) en zonas planas y suaves de la imagen, como cielos, paredes y degradados, que se intensifica al apilar un LoRA de estilo. El LoRA no es una release oficial de Krea ni cuenta con su respaldo.

El problema que resuelve es tecnico y acotado: el modelo Krea 2 Turbo genera imagenes en 8 pasos, pero ese proceso de destilacion introduce ruido fino que el modelo raw (Krea 2 Raw) no presenta. Este adaptador conserva la configuracion de turbo (8 pasos, CFG 1) y mantiene el nivel de detalle y contraste, pero reduce el moteado en las areas lisas. Segun las mediciones del propio autor, la reduccion es de aproximadamente un 70% en degradados suaves y un 30% en escenas detalladas, sin cambiar el flujo de trabajo en ComfyUI.

Se trata de un LoRA de difusion single-file distribuido en formato safetensors, con un tamano de repositorio de 0,5 GB. No aporta pesos base, sino que se aplica sobre Krea 2 Raw o sobre el pipeline turbo existente. La informacion proporcionada no detalla la arquitectura interna del modelo base Krea 2 ni su contexto, por lo que esos datos figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de difusion (adaptador de bajo rango) sobre Krea 2; rango 64, precision bf16 |
| Parametros totales | no disponible (adaptador LoRA; depende del rango y de las capas objetivo del modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagen text-to-image) |
| Tipos de cuantizacion | bf16 (fichero `krea2_turbo_lora_rank_64_bf16_low_mottle.safetensors`) |
| Idiomas soportados | no disponibles (los prompts de entrenamiento fueron solo texto, sin detalle de idiomas) |
| Licencia | Krea 2 Community License Agreement (license: other) |
| Formato de pesos | safetensors (diffusion-single-file) |

## Arquitectura y entrenamiento

Este artefacto no es un modelo completo, sino un adaptador LoRA de rango 64 en precision bf16 que se aplica sobre el LoRA turbo de Krea 2. El autor partio del LoRA turbo oficial, atenuo sus ultimas tres capas (los bloques donde se concentra la mayor parte del moteado) y despues lo ajusto finamente durante 500 pasos mediante destilacion TDM (text-to-image diffusion model distillation), el mismo tipo de entrenamiento empleado para producir modelos turbo de pocos pasos.

Ademas de la destilacion, el entrenamiento incorporo una funcion de perdida adicional que compara el ruido de las zonas planas con el del modelo raw, con el objetivo de mantener dichas regiones limpias. Un detalle relevante es que el entrenamiento se realizo unicamente con prompts de texto, sin imagenes. El codigo de entrenamiento esta disponible en el repositorio boo-musubi-tuner del autor. No se especifican en la informacion proporcionada el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO, por lo que estos datos figuran como no disponibles.

## Capacidades

- Generacion de imagenes text-to-image en 8 pasos con CFG 1, sustituyendo al LoRA turbo original en ComfyUI.
- Reduccion del ruido moteado en areas planas y suaves (cielos, paredes, degradados) respecto al LoRA turbo estandar.
- Compatibilidad con el apilado de LoRA de estilo, manteniendo la reduccion de moteado (aproximadamente 50% en degradados y 25% en escenas detalladas cuando el LoRA de estilo se aplica a fuerza 1.5).
- Preservacion del nivel de detalle y contraste del LoRA turbo original.
- Integracion directa en flujos de trabajo existentes de Krea 2 Turbo sin cambiar los parametros de muestreo.
- Soporte de prompts de texto (unico modo de entrenamiento declarado); no se documentan capacidades de vision, audio ni tool calling, que no aplican a un modelo de difusion de imagen.

## Casos de uso

- Generacion de imagenes de paisajes con cielos amplios: el adaptador mantiene los degradados del cielo limpios, evitando el moteado que el turbo original deja y que resulta especialmente visible en este tipo de composiciones.
- Renderizado de interiores y arquitectura: las paredes lisas y las superficies uniformes son zonas propensas al mottle; este LoRA las mantiene suaves, lo que reduce el postprocesado de limpieza.
- Ilustracion con degradados de color: util para fondos con transiciones cromaticas donde el ruido fino del turbo resulta molesto al ampliar.
- Flujos con LoRA de estilo apilados: al reducir el moteado incluso con un LoRA de estilo a fuerza 1.5, es adecuado para pipelines que combinan estilos sin perder limpieza en zonas planas.
- Produccion de assets en 8 pasos: al conservar la configuracion turbo (8 pasos, CFG 1), encaja en pipelines que priorizan velocidad de inferencia sin sacrificar la limpieza de las areas lisas.
- Prototipado rapido en ComfyUI: se puede cargar en lugar del LoRA turbo dentro del mismo grafo, manteniendo el resto del flujo intacto.
- Ajuste de calidad de imagen previa a upscaling: al partir de imagenes con menos ruido en zonas planas, el reescalado posterior tiende a amplificar menos artefactos.

## Benchmarks y rendimiento

El autor publica mediciones del ruido fino en las zonas mas planas de la imagen, promediadas sobre 6 semillas por prueba, comparando con el LoRA turbo original (menor es mejor):

| Prueba | Ruido respecto al turbo original |
|---|---|
| Degradado suave | aproximadamente 70% menos (similar al modelo raw) |
| Escena detallada | aproximadamente 30% menos |
| Degradado suave, LoRA de estilo a 1.5 | aproximadamente 50% menos |
| Escena detallada, LoRA de estilo a 1.5 | aproximadamente 25% menos |

No se han publicado resultados de benchmarks estandar (tipo FID, CLIP score o similares) en la informacion disponible.

## Requisitos de hardware

- VRAM de inferencia: el adaptador en si ocupa 0,5 GB (repositorio), pero la VRAM total depende del modelo base Krea 2 y del pipeline de difusion que se use; no disponible el dato concreto de VRAM para el modelo base en la informacion proporcionada.
- GPU recomendadas: no especificadas por el autor. En la practica, dependera de los requisitos del modelo Krea 2 subyacente.
- Compatibilidad con GPU de consumo: no confirmada; el autor solo indica que fue probado en ComfyUI con el modelo Krea 2 raw mas este LoRA, sin especificar la GPU empleada.
- Opciones de despliegue: ComfyUI (unico entorno probado y documentado por el autor). No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un adaptador de difusion de imagen. El autor declara explicitamente que no lo ha probado en otras herramientas.
- Latencia y throughput: no disponibles. Al conservar 8 pasos y CFG 1, el coste por imagen deberia ser equivalente al del LoRA turbo original, aunque no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos / CFG | Moteado en zonas planas | Licencia / disponibilidad |
|---|---|---|---|---|
| Krea 2 Turbo LoRA: Low Mottle (este) | LoRA de difusion, rank 64, bf16 | 8 pasos, CFG 1 | Reduccion de ~70% en degradados y ~30% en escenas detalladas | Krea 2 Community License; disponible en HuggingFace (rockerBOO) |
| Krea 2 Turbo LoRA (original) | LoRA de difusion | 8 pasos, CFG 1 | Referencia base; deja moteado en zonas lisas | Krea 2 Community License; oficial de Krea |
| Krea 2 Raw | Modelo base de difusion | no disponible | Sin moteado aparente en zonas planas | Krea 2 Community License; oficial de Krea |

No se dispone en la informacion proporcionada de otras alternativas comparables de terceros para este mismo modelo base.

## Limitaciones y advertencias

- El adaptador reduce el moteado, pero no lo elimina por completo; las escenas con mucho detalle siguen mostrando mas ruido que el modelo raw.
- Las imagenes cambian ligeramente respecto al LoRA turbo original para una misma semilla; la composicion no es identica.
- En degradados muy suaves, una semilla poco frecuente puede mostrar un tenue bandeado vertical.
- No corrige las estelas horizontales que algunos LoRA de estilo introducen.
- Solo ha sido probado en ComfyUI con el modelo Krea 2 raw mas este LoRA; no se ha verificado en otras herramientas.
- No es una release oficial de Krea ni cuenta con su respaldo.
- Licencia sujeta a la Krea 2 Community License Agreement, que incluye umbral de ingresos, requisitos de filtrado de contenido y una politica de uso aceptable. Es un producto derivado del LoRA turbo de Krea 2, por lo que su uso comercial esta condicionado por dichos terminos.
- Al entrenarse solo con prompts de texto, no se documenta el comportamiento multilingue ni la cobertura de idiomas de los prompts.
- Riesgo de sesgos y de alucinacion visual inherente al modelo base Krea 2, no evaluado en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rockerBOO/Krea-2-Turbo-LoRA-Low-Mottle
- Modelo base Krea 2 Raw: https://huggingface.co/krea/Krea-2-Raw
- Modelo base Krea 2 Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Licencia (PDF): https://huggingface.co/krea/Krea-2-Turbo/blob/main/LICENSE.pdf
- Informacion de licencia de Krea 2: https://krea.ai/krea-2-licensing
- Codigo de entrenamiento (boo-musubi-tuner): https://github.com/rockerBOO/boo-musubi-tuner
