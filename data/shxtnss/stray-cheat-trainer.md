# shxtnss/stray-cheat-trainer

## Resumen

El repositorio `shxtnss/stray-cheat-trainer` no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuido a traves de Hugging Face que, segun su propia model card, ofrece un supuesto "trainer" (herramienta de trampas) para videojuegos en plataformas Windows 10/11 de 64 bits. El contenido anunciado consiste en un archivo comprimido (`kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip`, 4,8 MB) protegido con contrasena y un ejecutable que requiere privilegios de administrador.

El artefacto se presenta con etiquetas propias de un modelo de lenguaje (multiples idiomas: en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) y licencia MIT, pero no incluye pesos, tokenizador, configuracion de arquitectura ni pipeline de inferencia. No hay evidencia de que exista un modelo neuronal subyacente: la model card describe modulos de overlay, radar 2D, escaner de offsets y teclas de panico, propios de software de trampas para videojuegos, no de un sistema de IA.

Por tanto, esta ficha documenta la ausencia de un modelo evaluable y advierte de los riesgos asociados al artefacto. Cualquier dato relativo a arquitectura, parametros, contexto o benchmarks debe considerarse no disponible, ya que el repositorio no los proporciona.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio; sin modelo linguistico asociado) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un ejecutable de Windows) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre arquitectura neuronal, datos de entrenamiento, numero de tokens, composicion del corpus ni tecnicas de alineacion (RLHF, DPO u otras). La model card no menciona transformer, MoE, SSM ni ningun otro diseno de red. Los unicos detalles tecnicos descritos se refieren a componentes de un ejecutable de Windows: nucleo externo en modo usuario, renderizado mediante Desktop Duplication, escaner dinamico de offsets con "99,5 % de consistencia" declarada, overlay externo a 144 Hz y consumo de RAM inferior a 44 MB. Estos datos corresponden a software de trampas, no a un modelo de aprendizaje automatico.

## Capacidades

- No se documenta ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad multilingue real pese a las etiquetas de idioma.
- Las unicas funciones descritas son propias de un trainer de videojuegos: perfiles JSON intercambiables, tecla de panico, radar 2D, filtro de botin, overlay externo y escaner de offsets.

## Casos de uso

- No procede: el artefacto no es un modelo de IA y no admite casos de uso de inferencia, generacion ni analisis.
- Evaluacion de modelos: no aplicable, al no existir pesos ni configuracion.
- Integracion en pipelines de IA: inviable, ya que no hay API, tokenizador ni formato de pesos.
- Despliegue en servidores de inferencia (vLLM, TGI, llama.cpp): no aplicable.
- Fine-tuning o adaptacion: no aplicable.
- Uso como referencia tecnica: unicamente como ejemplo de repositorio mal etiquetado en Hugging Face, util para estudiar practicas de moderacion y clasificacion de artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, ya que el repositorio no contiene un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable (no hay modelo).
- GPU recomendadas: no aplicable.
- Compatibilidad con GPU de consumo: no aplicable.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicable.
- Latencia y throughput: no disponibles.
- El unico requisito declarado es un sistema Windows 10/11 de 64 bits con procesador Intel o AMD x64, propio del ejecutable distribuido, no de un modelo de IA.

## Comparativa con modelos similares

No disponible. No existe una categoria de modelos comparable, dado que el repositorio no contiene un modelo de lenguaje ni un sistema de IA. Cualquier comparacion con modelos abiertos de distinto tamano o tarea carece de sentido tecnico.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, configuracion ni tokenizador; las etiquetas de idioma y la licencia MIT resultan enganosas en ese contexto.
- El artefacto distribuido es un ejecutable de Windows comprimido con contrasena, alojado en enlaces externos a Hugging Face (GitHub), lo que impide verificar su contenido y aumenta el riesgo de malware.
- La model card instruye a desactivar o sortear advertencias de Windows Defender y SmartScreen, una practica de alto riesgo en produccion y en entornos corporativos.
- Se solicita ejecutar el binario como administrador, lo que amplia la superficie de ataque del sistema.
- El software se presenta como trampa para videojuegos, lo que puede vulnerar los terminos de servicio de las plataformas afectadas y acarrear el baneo de cuentas.
- No hay evidencia de auditoria, reproducibilidad ni trazabilidad del binario.
- Cualquier uso comercial o en produccion debe descartarse por completo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/shxtnss/stray-cheat-trainer
- Enlace de descarga citado en la model card (GitHub): https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Repositorio GitHub citado en la model card: https://github.com/QuynhPrice46958/stray-cheat-trainer/releases/latest
