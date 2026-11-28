# DuoNeural/RMSN-104M-Omega12-mw72-Trisection-Topology91

## Resumen

RMSN-104M-Omega12-mw72-Trisection-Topology91 es un checkpoint de 104 millones de parametros desarrollado por DuoNeural, una organizacion de investigacion que publica bajo la denominacion Resonant Metriplectic Sheaf Network (RMSN). El modelo forma parte del llamado "Topological Phase Map", un estudio sistematico de distintas topologias de red bajo condiciones de resonancia de Arnold Tongue. Se trata, por tanto, de un artefacto de investigacion mas que de un modelo orientado a produccion.

La arquitectura declarada es RMSN, con 576 dimensiones de embedding, 16 capas y un ancho de ranura (M_w) de 72. El checkpoint corresponde a la topologia numero 91, de tipo "Direct TS (no cascade)", con un valor de perplejidad de validacion de aproximadamente 95 y un exponente de Lyapunov de validacion cercano a -0,001. La model card menciona hallazgos sobre bifurcaciones Z_3 y una "ley Hamming TS" que relaciona M_w con el tipo de transicion topologica.

El modelo es relevante unicamente dentro del contexto de investigacion de DuoNeural sobre dinamica metriplectica y estructuras de haz (sheaf). No dispone de documentacion sobre datos de entrenamiento, tokenizador, capacidades de generacion o evaluacion estandar, por lo que no debe considerarse un modelo de lenguaje de proposito general listo para uso practico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network) |
| Parametros totales | 104M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (checkpoint PyTorch, clave `ckpt['model']`) |

Otros parametros declarados en la model card: dimension D = 576, profundidad L = 16, ancho de ranura M_w = 72, Omega (Arnold Tongue) = 1/2, M_eff (fiber bundles) = 4, topologia #91, val_ppl ~95, val_lyap ~-0,001.

## Arquitectura y entrenamiento

La model card describe el modelo como una Resonant Metriplectic Sheaf Network (RMSN), una arquitectura propietaria de DuoNeural que combina conceptos de geometria metriplectica (sistemas dinamicos con estructura de gradiente y flujo hamiltoniano) y teoria de haces (sheaf theory). Los hiperparametros publicados son D = 576, L = 16, M_w = 72 y Omega = 1/2, con 4 "fiber bundles" efectivos. No se especifica si la red es un transformer, un SSM o una arquitectura hibrida, ni se detalla el mecanismo de atencion o de mezcla de informacion.

No hay informacion sobre el corpus de entrenamiento, el numero de tokens procesados, la composicion del dataset, el tokenizador ni si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones. La model card se limita a describir propiedades topologicas del entrenamiento: la topologia #91 presenta una bifurcacion Z_3 con trisection aislada en las capas L6 (L/3) y L10-11 (2L/3), y se afirma que constituye la primera prueba de una sub-ley 3-adica de cruce de D_min (D = 576 frente a D_min ~400-500). Tambien se menciona la "Hamming TS Law", segun la cual M_w 3-smooth menor o igual a 96 conduce a una transicion Direct TS. Estos datos son afirmaciones del autor sin verificacion externa disponible.

## Capacidades

- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas o vision en la informacion proporcionada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues ni idiomas soportados.
- No se documenta modo "thinking", vision, audio ni ninguna capacidad especial de inferencia.
- La unica funcionalidad demostrada en la model card es la carga del checkpoint mediante `torch.load` y el acceso a los pesos en `ckpt['model']`.

## Casos de uso

- Reproduccion de experimentos de investigacion: el checkpoint permite recargar los pesos y reproducir las mediciones de val_ppl y val_lyap reportadas para la topologia #91 dentro del Topological Phase Map de DuoNeural.
- Estudio de dinamica metriplectica: util para investigadores que analicen el comportamiento de redes con estructura de haz y flujo metriplectico en regimenes de resonancia Arnold Tongue con Omega = 1/2.
- Analisis de bifurcaciones topologicas: sirve para examinar la afirmacion de trisection aislada en L6 y L10-11 y contrastar la sub-ley 3-adica de D_min con otras topologias del mismo estudio.
- Comparacion entre topologias del Phase Map: al ser un checkpoint de una serie, permite contrastar la topologia #91 (Direct TS) con otras topologias publicadas por DuoNeural bajo la misma familia RMSN.
- Validacion de la Hamming TS Law: adecuado para reproducir la relacion entre M_w 3-smooth y el tipo de transicion Direct TS en modelos de ~100M de parametros.
- Docencia y divulgacion sobre arquitecturas no convencionales: puede usarse como ejemplo practico de redes basadas en teoria de haces y sistemas dinamicos en cursos avanzados de machine learning.

## Benchmarks y rendimiento

La model card solo reporta metricas internas del estudio topologico:

| Metrica | Valor |
|---|---|
| val_ppl | ~95 |
| val_lyap | ~-0,001 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repo ocupa 0,9 GB, lo que sugiere que los pesos en precision original caben en GPUs consumer con 2-4 GB de VRAM.
- GPU recomendadas: no disponible. Por tamano (104M de parametros) el modelo cabria en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090), pero no se documenta el soporte de inferencia.
- Cabe en GPU consumer: probablemente si, dado el tamano del repo, aunque no se confirma en la documentacion.
- Opciones de despliegue: solo se documenta la carga via `torch.load` en PyTorch. No se menciona soporte para vLLM, llama.cpp, Ollama, TGI ni otros motores de inferencia.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (redes RMSN o arquitecturas basadas en teoria de haces) ni datos de rendimiento que permitan una comparacion con modelos de lenguaje de ~100M de parametros.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre datos de entrenamiento, tokenizador y procedimiento de evaluacion, lo que impide validar las afirmaciones de la model card.
- No se documentan capacidades de generacion de texto ni de lenguaje natural; no debe asumirse que el modelo sea util como modelo de lenguaje de proposito general.
- Las afirmaciones cientificas (sub-ley 3-adica, Hamming TS Law, "Direct True Silent") son declaraciones del autor sin revision externa ni replicacion independiente disponible.
- El checkpoint se distribuye en formato `.pt` (pickle de PyTorch), lo que implica riesgos de seguridad al cargarlo desde fuentes no verificadas; se recomienda usar `weights_only=True` o auditar el archivo antes de `torch.load`.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero al no existir documentacion sobre el origen de los datos de entrenamiento no puede garantizarse la ausencia de riesgos de propiedad intelectual o de sesgos en los datos.
- No se especifican idiomas soportados, por lo que no puede recomendarse para aplicaciones multilingues.
- Riesgo de alucinacion y sesgos: no evaluable con la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-104M-Omega12-mw72-Trisection-Topology91
- Organizacion DuoNeural en Hugging Face: https://huggingface.co/DuoNeural
- Repositorio GitHub de RMSN: https://github.com/duoneural/rmsn
