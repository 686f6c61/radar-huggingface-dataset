# chenana07X/gwp05-robodojo-delta-step50000

## Resumen

gwp05-robodojo-delta-step50000 es un ajuste fino del modelo de politica robotica Giga-World-Policy-0.5 (GWP-0.5), desarrollado por el usuario chenana07X y publicado en HuggingFace. Se trata de un transformer MoT (Mixture of Transformers, segun la propia model card) entrenado para generar acciones de control bimanual sobre datos del conjunto RoboDojo, con 3500 episodios en los que las articulaciones de 14 dimensiones se proyectan a un lienzo de 16 dimensiones. No es un modelo de lenguaje: es una politica visuomotora orientada a robotica de manipulacion.

El checkpoint corresponde al paso 50000 de entrenamiento y emplea modo de accion delta, es decir, las dimensiones de articulacion representan el incremento respecto al estado inicial (`action − state_start`), mientras que las dimensiones de pinza se mantienen en valor absoluto. Esta eleccion de representacion es critica: mezclar modo absoluto y modo delta produce un error de escala de aproximadamente diez veces, segun advierte el autor.

Su relevancia actual es la de servir como artefacto de investigacion reproducible para evaluacion en lazo abierto sobre RoboDojo y como punto de partida para nuevos ajustes finos con la misma receta. El autor indica explicitamente que la evaluacion en lazo cerrado sobre robot real todavia no se ha realizado, por lo que se trata de un modelo en fase de validacion experimental y no de un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoT (Mixture of Transformers), segun model card |
| Parametros totales | no disponible |
| Parametros activos | no disponible (la model card no indica que sea MoE) |
| Longitud de contexto | no disponible; el chunk de acciones es de 48 pasos a 25 fps (aprox. 1,92 s de horizonte) |
| Tipos de cuantizacion | no disponible (solo se publica `diffusion_pytorch_model.bin`) |
| Idiomas soportados | no aplica / no disponible (modelo de politica robotica, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch binario (`diffusion_pytorch_model.bin`) + `config.json`; no se publican safetensors ni GGUF |
| Dimension de accion | 16D (lienzo), con 14 dimensiones utiles y 2 de relleno |
| Modo de accion | delta (articulaciones) + absoluto (pinzas) |
| Tamano del repositorio | 24,1 GB |
| Libreria | diffusers |
| Fecha de publicacion | 2026-10-13 |

## Arquitectura y entrenamiento

La model card describe el modelo como un transformer MoT, siguiendo la misma receta que el ajuste fino delta del despliegue SBInt. No se detalla en la informacion disponible el numero de capas, dimensiones ocultas ni el mecanismo interno completo del MoT, por lo que esos datos quedan como no disponibles. El checkpoint publicado corresponde al modelo EMA del paso 50000 y se distribuye junto a un fichero de estadisticas de normalizacion especifico (`norm_stats_robodojo_gwp16d_delta.json`) que debe usarse obligatoriamente en pareja con los pesos.

El entrenamiento se realizo sobre datos de RoboDojo (3500 episodios, articulaciones de 14D proyectadas a un lienzo de 16D) empleando 2 nodos de 8 GPU H100 cada uno (16 H100 en total), 50000 pasos, batch efectivo de 128, learning rate de 6e-5 con el optimizador CAME8Bit, DeepSpeed ZeRO-2 y un chunk de acciones de 48 pasos a 25 fps. La perdida final registrada en el paso 50000 fue de 0,087 en el termino visual y 0,006 en el termino de accion. No se menciona en la informacion disponible el uso de RLHF, DPO ni otras tecnicas de alineamiento, algo coherente con un modelo de politica entrenado por imitacion.

La semantica de la accion es 16D en orden izquierda primero: `[larm_0..5, lgrip, rarm_0..5, rgrip]`. La mascara delta es `[T]*6 + [F] + [T]*6 + [F]`, de modo que las 12 dimensiones de articulacion se predicen como delta respecto al estado inicial y las 2 dimensiones de pinza se predicen en valor absoluto. Las dimensiones 6 y 14 son relleno y valen siempre cero. En inferencia, la reconstruccion del valor absoluto se realiza como `pred_abs = pred + state_start` sobre las dimensiones de articulacion, tras desnormalizar.

## Capacidades

- Generacion de acciones de control bimanual en un espacio de 16 dimensiones (12 articulaciones en modo delta, 2 pinzas en absoluto y 2 dimensiones de relleno fijas a cero).
- Prediccion de chunks de accion de 48 pasos correspondientes a 25 fps (aproximadamente 1,92 segundos de trayectoria por inferencia).
- Condicionamiento visual para la generacion de acciones, propio de una politica visuomotora; la model card no detalla la modalidad de entrada mas alla de referirse a la perdida visual.
- Ajuste fino posterior sobre nuevos conjuntos de datos de robotica empleando la misma receta delta.
- Evaluacion en lazo abierto sobre episodios de RoboDojo mediante el script `scripts/open_loop_robodojo_ep.py`.
- No se documentan capacidades de generacion de texto, razonamiento linguistico, codigo, matematicas, tool calling, function calling ni razonamiento multi-paso. Al ser un modelo de politica, estas capacidades no aplican.
- No se documentan capacidades multilingues ni de audio o vision generativa mas alla del condicionamiento visual inherente a la politica.
- Despliegue en robot real en lazo cerrado: pendiente, el autor indica que no se ha realizado todavia.

## Casos de uso

- Evaluacion en lazo abierto sobre RoboDojo: el modelo predice chunks de 48 acciones que se comparan con las trayectorias de referencia del conjunto, utilizando el script proporcionado en el repositorio de codigo. Es el flujo de validacion documentado y el unico con soporte explicito.
- Punto de partida para ajustes finos adicionales: la receta delta, el fichero de normalizacion y la configuracion de entrenamiento estan descritos con suficiente detalle (CAME8Bit, ZeRO-2, lr 6e-5, batch 128) como para reutilizar el pipeline sobre nuevos datasets de manipulacion.
- Baseline de comparacion en investigacion sobre representaciones de accion: permite medir el efecto de la representacion delta frente a la absoluta, dado que el propio autor advierte de un error de escala de aproximadamente diez veces al mezclar ambas.
- Estudio de world models aplicados a control: al derivar de Giga-World-Policy-0.5, sirve para analizar como un modelo con componente de prediccion visual se comporta al especializarse en un dominio robotico concreto.
- Recoleccion de datos dirigida: las predicciones del modelo pueden usarse para priorizar episodios o configuraciones en las que la perdida de accion (0,006) y la visual (0,087) indican margen de mejora.
- Integracion en pipelines de simulacion: el chunk de 48 pasos a 25 fps permite evaluar politicas en entornos simulados con control a frecuencia fija, reutilizando el codigo de evaluacion abierta.
- Banco de pruebas para infraestructura de inferencia: sus 24,1 GB en formato binario lo convierten en un caso util para validar despliegues con mucho peso en GPU antes de pasar a lazo cerrado.
- Despliegue en robot real: contemplado por el autor, pero no validado; requeriria completar la evaluacion en lazo cerrado y aportar el VAE, tokenizador y codificador de texto que no se incluyen en este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo de rendimiento son las perdidas de entrenamiento en el paso 50000:

| Metrica | Valor (paso 50000) |
|---|---|
| Perdida visual | 0,087 |
| Perdida de accion | 0,006 |
| Pasos de entrenamiento | 50000 |
| Batch efectivo | 128 |
| Learning rate | 6e-5 (CAME8Bit) |
| Chunk de accion | 48 a 25 fps |

No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de benchmarks de robotica como simulaciones estandar, tasas de exito en tareas o metricas de lazo cerrado.

## Requisitos de hardware

- Entrenamiento original: 2 nodos de 8 GPU H100 cada uno (16 H100) con DeepSpeed ZeRO-2. Esto da una idea del orden de magnitud de recursos que requiere el pipeline completo.
- VRAM de inferencia: no disponible de forma oficial. Como referencia aritmetica, el repositorio ocupa 24,1 GB en formato `.bin` (habitualmente fp32); cargar solo los pesos de la politica consumiria del orden de 24 GB de VRAM, a lo que hay que sumar activaciones, estado del optimizador si se reajusta y los componentes ausentes del repositorio (VAE, tokenizador y codificador de texto) que deben aportarse desde la base de inferencia del despliegue SBInt.
- GPU recomendadas: dada la ausencia de cuantizaciones publicadas, el escenario realista es GPU de centro de datos (H100, A100 80 GB). No hay evidencia de que quepa en GPU de consumo.
- GPU de consumo: no disponible; no se publican pesos en 8 bits, 4 bits, GGUF ni safetensors que permitan reducir el consumo.
- Opciones de despliegue: la libreria declarada es `diffusers`, por lo que el punto de entrada natural es el pipeline de diffusers. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y en cualquier caso no serian aplicables a un modelo de politica con salida de acciones.
- Latencia y throughput: no disponibles. El unico dato temporal es la frecuencia de control objetivo, 25 fps, con chunks de 48 pasos, lo que implica una frecuencia de re-planificacion inferior a 25 Hz.
- Requisito de emparejamiento: los pesos deben usarse junto con `norm_stats_robodojo_gwp16d_delta.json` y con `--action-mode delta`. Cualquier otro emparejamiento degrada la salida de forma severa.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con los dos artefactos citados en la propia model card. No se dispone de datos de terceros (como otras politicas roboticas publicas) en el material proporcionado.

| Modelo | Relacion | Parametros | Contexto/chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Giga-World-Policy-0.5 (`open-gigaai/Giga-World-Policy-0.5`) | Modelo base del ajuste fino | no disponible | no disponible | no disponible | publico en HuggingFace |
| gwp05-robodojo-delta-step50000 | Ajuste fino delta sobre RoboDojo, paso 50000 | no disponible | chunk 48 @ 25 fps | no disponible | publico en HuggingFace, 0 descargas |
| Ajuste fino delta del despliegue SBInt | Misma receta declarada por el autor | no disponible | no disponible | no disponible | referenciado en la model card, sin enlace directo |

No se dispone de datos de rendimiento comparativo entre estos artefactos en la informacion proporcionada.

## Limitaciones y advertencias

- Evaluacion en lazo cerrado no realizada: el autor indica explicitamente que la evaluacion sobre robot real esta pendiente, por lo que no hay evidencia de que la politica funcione fuera del conjunto de evaluacion abierto.
- Sensibilidad critica al modo de accion: mezclar modo absoluto y delta produce un error de escala de aproximadamente diez veces. El checkpoint, el fichero de normalizacion y el flag `--action-mode delta` deben usarse siempre en conjunto.
- Dependencias ausentes: el repositorio no contiene VAE, tokenizador ni codificador de texto. Sin la base de inferencia del despliegue SBInt (documentada en `handoff/ROBODOJO_GWP05.md` del repositorio de codigo), el checkpoint no es utilizable por si solo.
- Licencia no especificada: al no declararse licencia, no puede asumirse permiso de uso comercial. Cualquier uso en produccion requiere aclaracion previa por parte del autor.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin historial de validacion por terceros.
- Sesgos: no hay informacion publicada sobre la composicion demografica, geografica o de dominio de los 3500 episodios de RoboDojo, por lo que no puede evaluarse el sesgo de dominio de la politica.
- Riesgo de alucinacion: en el contexto de una politica robotica, el equivalente es la generacion de acciones fisicamente invalidas o fuera de distribucion cuando el estado observado difiere del dataset de entrenamiento. No hay datos publicados sobre este comportamiento.
- Limitacion de dominio: el modelo esta especializado en un unico conjunto de datos (RoboDojo) y una morfologia concreta (dos brazos de 6 articulaciones mas pinza). No se documenta transferencia a otras morfologias.
- Restricciones de idioma: no aplica, el modelo no procesa lenguaje de forma documentada.
- Formato de pesos unico: solo `.bin`, sin safetensors, lo que limita las opciones de carga segura y de cuantizacion.
- Fecha de publicacion futura respecto al momento habitual de consulta (2026-10-13), dato que conviene verificar antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chenana07X/gwp05-robodojo-delta-step50000
- Modelo base: https://huggingface.co/open-gigaai/Giga-World-Policy-0.5
- Repositorio de codigo: https://github.com/zhujohn9604/giga-world-policy
- Script de evaluacion en lazo abierto: `scripts/open_loop_robodojo_ep.py` (en el repositorio de codigo)
- Documento de integracion del despliegue SBInt: `handoff/ROBODOJO_GWP05.md` (en el repositorio de codigo)
- Fichero de normalizacion: `norm_stats_robodojo_gwp16d_delta.json` (en el repositorio del modelo)
- Paper, blog o demo: no disponible en la informacion proporcionada
