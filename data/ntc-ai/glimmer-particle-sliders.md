# ntc-ai/glimmer-particle-sliders

## Resumen

Glimmer Particle Sliders es un adaptador experimental de bajo rango publicado por ntc-ai sobre el modelo base meta-models/Muse-Glimmer-30B, un transformer de 30.000 millones de parametros del que no se detallan mas especificaciones en la informacion disponible. El adaptador no es un LoRA convencional: implementa un mecanismo denominado "particle sliders" en el que una nube de 128 particulas aprendidas condiciona, mediante un router dependiente del token de entrada, la salida de un adaptador no lineal de rango ocho aplicado a las proyecciones de atencion del modelo base. El objetivo es modular el estilo de generacion (por ejemplo, un tono somnoliento o un registro caotico de mensajeria) manteniendo congelados los pesos del modelo base.

El repositorio incluye dos adaptadores completos, Sleepy y Chaotic Texting, y una demo con una comparacion grabada de una misma pregunta bajo el modelo sin adaptador y con el adaptador Sleepy. El autor advierte explicitamente de que los pesos nativos no implican compatibilidad con LoRA ordinario: existe una destilacion ridge separada que aproxima cada adaptador como un LoRA lineal, pero la demo utiliza unicamente las particulas originales.

La relevancia actual es acotada y experimental: se trata de un lanzamiento con cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks publicados, con la demo en vivo deshabilitada y con un screen de fidelidad PEFT estandar aun en curso segun STATUS.md. Es interesante como exploracion de adaptadores condicionados por una nube de particulas y de entrenamiento tipo ParticleGAN en lugar de RL, pero no como pieza lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de bajo rango no lineal condicionado por particulas (router + nube compartida de 128 particulas de dimension 4 + red f) sobre las proyecciones q_proj, k_proj, v_proj y o_proj de un transformer base |
| Parametros totales | No disponible (el repo ocupa 0,2 GB; el modelo base es Muse-Glimmer-30B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Muse-Glimmer-30B, no especificada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria PEFT) |

## Arquitectura y entrenamiento

El adaptador opera sobre la proyeccion congelada W(x) de cada rama de atencion. Para una entrada x se calcula una proyeccion descendente de rango ocho u = Ax, un router q de anchura 16 que produce pesos softmax sobre una nube compartida P de 128 particulas en R^128x4, y una red no lineal f de anchura 48 que combina u con la mezcla z(u) de particulas. La salida es y = W(x) + s·U·B(Ax, P), donde s es la fuerza elegida por el usuario y el factor alpha/rank guardado es 8/8 = 1. La nube es compartida entre las cuatro proyecciones de atencion del texto; la torre de vision y las proyecciones MLP no se entrenan en esta integracion. El enrutamiento depende del token de entrada y las 128 particulas contribuyen siempre mediante pesos suaves; con fuerza 0 la implementacion omite la rama exactamente. Varios adaptadores compatibles pueden combinarse sumando sus terminos en cada proyeccion, aunque el autor advierte de que esto no garantiza mezclas predecibles.

El entrenamiento no usa RL sino un esquema ParticleGAN. Se emparejan una instruccion de comportamiento positiva y una condicion neutra con los mismos token IDs de continuacion causal, usando un mensaje de sistema explicito con contenido vacio (lo que difiere de omitir dicho mensaje). Sea h+ el vector oculto final del profesor instruido congelado y h_theta el vector adaptado en la posicion equivalente; se define el residuo delta_theta = N(h_theta) - N(h+), donde N es un normalizador de edicion emparejada fijado que escala por desviaciones muestrales por coordenada con un factor de escala ajustado sobre el banco de entrenamiento y retenido en evaluacion. Un critico aprende a distinguir el error residual frente a ruido gaussiano compartido, con una perdida de generador que incluye un termino R_VIC sobre la varianza y covarianza de las particulas muestreadas, y un tope unilateral del critico aplicado cada cuatro actualizaciones con el cuadrado de la norma del gradiente de entrada. El autor menciona tambien una destilacion ridge separada que aproxima cada adaptador como un LoRA lineal ordinario.

## Capacidades

- Generacion de texto en ingles con modulacion de estilo controlada por el adaptador (tono somnoliento, registro caotico de mensajeria) sobre el modelo base Muse-Glimmer-30B.
- Control de intensidad del efecto mediante un parametro de fuerza s, con bypass exacto de la rama cuando s = 0.
- Mezcla de multiples adaptadores compatibles sumando sus contribuciones en cada proyeccion, sin garantia de comportamientos independientes ni de mezclas predecibles.
- Enrutamiento de particulas dependiente del token actual, con pesos softmax sobre 128 particulas compartidas.
- Capacidades heredadas del modelo base (razonamiento, codigo, matematicas, tool calling, agentes, multilingue) no documentadas en la informacion disponible para este adaptador.
- No se documentan modos de pensamiento, vision ni audio especificos del adaptador; la torre de vision del base no se entrena en esta integracion.

## Casos de uso

- Experimentacion en investigacion sobre adaptadores condicionados por particulas: el repositorio permite reproducir el esquema ParticleGAN y comparar la nube de 128 particulas frente a un LoRA lineal equivalente obtenido por destilacion ridge, util para estudiar si el condicionamiento no lineal aporta ventaja medible.
- Prototipado de personas conversacionales con control de intensidad: el parametro de fuerza s permite ajustar el grado de efecto (por ejemplo, Sleepy 1.75) sin reentrenar, adecuado para demos de estilo en ingles.
- Estudio de mezcla de adaptadores: la formula de suma por proyeccion permite probar combinaciones de Sleepy y Chaotic Texting y medir si los comportamientos se mantienen separables, como linea de investigacion sobre composicionalidad de adaptadores.
- Evaluacion de fidelidad de destilacion: comparar la salida de las particulas RAW 1024 con la aproximacion LoRA lineal producida por la destilacion ridge para cuantificar la perdida de fidelidad del adaptador lineal.
- Docencia y divulgacion sobre tecnicas de adaptacion: los ejemplos grabados con semilla 7, decodificacion greedy y presupuesto de 384 tokens sirven como caso concreto de comparacion OFF/ON reproducible sin GPU.
- Analisis de robustez de normalizadores de edicion emparejada: el normalizador N fijado sobre el banco de entrenamiento y retenido en evaluacion es un objeto de estudio util para quien investigue entrenamiento por edicion de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que el screen de fidelidad PEFT estandar esta en curso y se registra por separado en STATUS.md, y que la demo en vivo esta deshabilitada a la espera de artefactos aprobados y hardware.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador ocupa 0,2 GB, pero requiere cargar el modelo base Muse-Glimmer-30B, cuyos requisitos de VRAM no se especifican en la informacion disponible.
- GPU recomendadas: no disponibles. La demo en vivo se describe como pendiente de aprovisionamiento de hardware, sin especificar modelo de GPU.
- Viabilidad en GPU de consumo: no disponible; depende del modelo base de 30.000 millones de parametros y de la cuantizacion, que no se documenta.
- Opciones de despliegue: la libreria declarada es PEFT; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y el autor advierte de que los pesos nativos no implican compatibilidad con LoRA ordinario.
- Latencia y throughput: no disponibles. La demo en vivo, una vez cualificada, limita la salida a 64 tokens, un presupuesto distinto del usado en las grabaciones (384 tokens).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ntc-ai/glimmer-particle-sliders | Adaptador sobre base de 30B | No disponible | Adaptador de particulas no lineal | MIT | Hugging Face, 0 descargas |
| LoRA convencional sobre Muse-Glimmer-30B | Rango bajo lineal | No disponible | Adaptador lineal | Segun autor | No disponible en la informacion |
| Destilacion ridge del propio adaptador | Aproximacion lineal de rango bajo | No disponible | LoRA lineal aproximado | MIT (mismo repo) | Mencionada, no publicada como artefacto independiente |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo experimental: cero descargas y cero likes en el momento de la consulta, y demo en vivo deshabilitada.
- Los pesos nativos no son compatibles con LoRA ordinario; la destilacion ridge que aproxima cada adaptador como LoRA lineal es un artefacto separado y no se usa en la demo.
- Solo ingles: la model card declara unicamente el idioma en.
- La comparacion grabada es un ejemplo ilustrativo, no un resultado de generalizacion ni una salida simulada; no debe interpretarse como evidencia de rendimiento sistematico.
- El screen de fidelidad PEFT estandar esta incompleto segun STATUS.md.
- La mezcla de multiples adaptadores no garantiza comportamientos independientes ni mezclas predecibles.
- El enrutamiento depende del token de entrada y usa pesos suaves sobre las 128 particulas; el comportamiento fuera de la distribucion de entrenamiento no esta documentado.
- El normalizador de edicion se ajusta sobre el banco de entrenamiento y se retiene en evaluacion, lo que puede introducir sesgo hacia esa distribucion.
- Riesgo de alucinacion y sesgos: no documentados especificamente para el adaptador; heredados del modelo base, sin evaluacion publicada.
- Licencia MIT para el adaptador, pero el uso comercial depende tambien de la licencia del modelo base Muse-Glimmer-30B, no especificada en la informacion disponible.
- El mensaje de sistema explicito con contenido vacio difiere de omitirlo, lo que puede afectar a la reproducibilidad si no se replica exactamente.

## Enlaces

- Hugging Face: https://huggingface.co/ntc-ai/glimmer-particle-sliders
- Demo Space: https://huggingface.co/spaces/ntc-ai/glimmer-particle-sliders
- Codigo fuente: https://github.com/mikkel/meta-glimmer-particle-slider
- Ejemplos exactos: examples.json (en el repositorio)
- Guia rapida: QUICKSTART.md (en el repositorio)
- Manifiesto de release: catalog.json (en el repositorio)
- Estado del proyecto: STATUS.md (en el repositorio)
- Modelo base: meta-models/Muse-Glimmer-30B (referenciado en la model card)
