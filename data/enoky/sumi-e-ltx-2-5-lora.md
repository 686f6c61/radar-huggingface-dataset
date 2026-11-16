# enoky/sumi-e-ltx-2.5-lora

## Resumen

Sumi-e ink painting LoRA es un adaptador de estilo de bajo rango (rank 32) para el modelo de generacion de video Lightricks LTX-2.5, desarrollado por el usuario enoky. Su funcion es transformar las salidas del modelo base para que adopten la estetica de la pintura sumi-e japonesa: trazos de tinta negra, aguadas grises, textura de papel y amplio espacio vacio. No es un modelo autonomo, sino un complemento que se carga junto al transformer de difusion de LTX-2.5.

El adaptador se entreno sobre un subconjunto curado y deduplicado del dataset takara-ai/Sumi-e_no_kurozuappu_ink_painting_closeups, compuesto por imagenes sinteticas recaptionadas en lenguaje natural. Las imagenes se trataron como clips de un solo fotograma, de modo que el LoRA aprende el aspecto visual mientras que el movimiento lo aporta el modelo base.

Es relevante para quien trabaje con pipelines de text-to-video y necesite un control de estilo concreto sin reentrenar el modelo completo. El repositorio ocupa 0,3 GB y el unico archivo de pesos es un safetensors compatible con ComfyUI y ltx-pipelines. La licencia es la LTX-2 Community License, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer de difusion LTX-2.5 |
| Parametros totales | no disponible (rango 32; tamano de repo 0,3 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | LTX-2 Community License (ltx-2-community-license) |
| Formato de pesos | safetensors (sumi-e_ltx-2.5_lora.safetensors, step_02000, rank 32) |

## Arquitectura y entrenamiento

El LoRA se aplica sobre la rama de video del transformer de LTX-2.5, concretamente sobre las capas de self-attention, cross-attention de texto y feed-forward. Se entreno con la herramienta oficial Lightricks `ltx-trainer` sobre el transformer de desarrollo `ltx-2.5-22b-dev-transformer-bf16.safetensors`, que da nombre al checkpoint de 22B parametros del modelo base. El adaptador alcanza el paso 2000 de entrenamiento con rango 32.

Los datos de entrenamiento proceden de un subconjunto curado y deduplicado del dataset takara-ai/Sumi-e_no_kurozuappu_ink_painting_closeups, formado por imagenes sinteticas recaptionadas en lenguaje natural. Cada imagen se trato como un clip de un solo fotograma, por lo que el adaptador aprende la apariencia estilistica pero no el movimiento, que queda delegado al modelo base. No se documentan tecnicas adicionales como RLHF, DPO o decodificacion especulativa.

## Capacidades

- Aplicacion de estilo sumi-e a la generacion de video text-to-video de LTX-2.5: tinta negra, aguadas grises, textura de papel y espacio negativo.
- Control de estilo mediante palabra de activacion: el prompt debe comenzar por `sumi-e ink painting,`.
- Ajuste de intensidad del estilo mediante el peso del LoRA, con rango recomendado de 0,7 a 1,0.
- Compatibilidad con el pipeline `ltx_pipelines.ti2vid_one_stage` y con ComfyUI (formato de claves del adaptador).
- Generacion de video con rama de audio del modelo base (el pipeline de ejemplo carga un VAE de audio).
- No soporta tool calling, agentes ni razonamiento multi-paso: es un adaptador de estilo visual, no un modelo de lenguaje.

## Casos de uso

- Produccion de piezas de animacion con estetica japonesa tradicional: se carga el LoRA con peso 0,7-1,0 sobre LTX-2.5 y se generan clips con prompts que empiecen por `sumi-e ink painting,` para obtener planos de tinta sobre papel.
- Ilustracion de contenido editorial o cultural: videos breves de ambientacion para articulos sobre arte japones, meditacion o naturaleza, aprovechando el sesgo del LoRA hacia primeros planos (hojas de bambu, flores, detalles organicos).
- Pruebas de concepto de estilo en pipelines de video generativo: el adaptador permite evaluar rapidamente una direccion artistica concreta antes de invertir en un entrenamiento propio de mayor alcance.
- Generacion de fondos y transiciones para proyectos audiovisuales: clips con textura de papel y espacio vacio que funcionan como material de relleno o transicion entre escenas.
- Experimentacion en investigacion sobre control de estilo en difusion de video: al ser un LoRA de rango 32 entrenado sobre imagenes tratadas como clips de un fotograma, sirve como caso de estudio de transferencia de estilo estatico a video.
- Integracion en flujos de ComfyUI para artistas tecnicos: el formato de claves del adaptador permite encadenarlo con otros nodos y LoRAs del ecosistema LTX-2.5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 0,3 GB, pero requiere cargar el transformer de desarrollo de LTX-2.5 (checkpoint de 22B parametros en bf16) junto con el text encoder Gemma-4-12B, el VAE de video y el VAE de audio.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por el tamano del transformer (22B en bf16) y del text encoder (12B) se requiere hardware de gama alta, aunque no se documentan cifras concretas.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Viabilidad en GPU de consumo: no disponible; el peso combinado de los componentes hace improbable su ejecucion en tarjetas de consumo sin cuantizacion adicional, dato no documentado.
- Opciones de despliegue: `ltx-pipelines` (comando `ltx_pipelines.ti2vid_one_stage` con `--lora`) y ComfyUI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sumi-e LTX-2.5 LoRA (enoky) | LoRA de estilo sobre LTX-2.5 | rank 32, repo 0,3 GB | no disponible | LTX-2 Community License | Hugging Face |
| LTX-2.5 (Lightricks) | Modelo base text-to-video | 22B (transformer dev) | no disponible | LTX-2 Community License | Hugging Face |
| Otros LoRAs de estilo para LTX-2.5 | Adaptadores de estilo | no disponible | no disponible | segun autor | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento ni de otros adaptadores comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Las imagenes de entrenamiento son generadas por IA, por lo que el LoRA hereda los defectos del generador ademas del estilo.
- Fuerte sesgo hacia el encuadre en primer plano: los prompts con planos generales o amplios pueden producir resultados menos fieles al estilo.
- El LoRA no aporta movimiento propio; la calidad y coherencia del movimiento dependen enteramente del modelo base LTX-2.5.
- Requiere la palabra de activacion `sumi-e ink painting,` al inicio del prompt para activar el estilo de forma fiable.
- Licencia LTX-2 Community License: es una licencia "other" derivada del modelo base, con posibles restricciones para uso comercial que deben consultarse en el enlace oficial antes de desplegar en produccion.
- Los datos de entrenamiento (Takara.ai, CC BY 4.0) exigen atribucion segun los terminos de dicha licencia.
- No hay informacion sobre sesgos culturales o de representacion mas alla del sesgo de encuadre indicado.
- Riesgo de alucinacion visual: como todo modelo generativo de video, puede producir artefactos o incoherencias temporales no documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/enoky/sumi-e-ltx-2.5-lora
- Modelo base LTX-2.5: https://huggingface.co/Lightricks/LTX-2.5
- Repositorio ltx-pipelines (Lightricks LTX-2): https://github.com/Lightricks/LTX-2
- Dataset de entrenamiento: https://huggingface.co/datasets/takara-ai/Sumi-e_no_kurozuappu_ink_painting_closeups
- Licencia Creative Commons BY 4.0: https://creativecommons.org/licenses/by/4.0/
