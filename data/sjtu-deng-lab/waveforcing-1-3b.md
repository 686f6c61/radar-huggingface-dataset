# SJTU-DENG-Lab/WaveForcing-1.3B

## Resumen

WaveForcing-1.3B es un modelo de generacion de video a partir de texto (text-to-video) desarrollado por el laboratorio SJTU-DENG-Lab de la Universidad Jiao Tong de Shanghai. No se trata de un modelo independiente completo, sino de los pesos de inferencia que sustituyen al denoisador del modelo Wan2.1-T2V-1.3B, permitiendo generar video en pocas pasos (4 o 5 pasos de difusion frente a los ~50 tradicionales) y en regimen de streaming. Su relevancia radica en la combinacion de dos ideas: destilacion de pasos de denoising y generacion causal en streaming, lo que permite producir video de forma casi en tiempo real en lugar de esperar a que termine todo el proceso de muestreo.

La arquitectura se basa en el transformer de difusion de Wan2.1 (1.3B parametros para el denoisador), con un pipeline que incluye codificador de texto, tokenizador y VAE procedentes del repositorio oficial de Wan-AI. El repositorio pesa 5,7 GB y distribuye los pesos en formato safetensors nativo de Wan. Esta pensado para desarrolladores que quieren integrar generacion de video interactiva o por bloques en aplicaciones, con licencia Apache 2.0 que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (denoisador de Wan2.1-T2V-1.3B) con WaveForcing para streaming |
| Parametros totales | 1.3B (denoisador); texto y VAE no incluidos |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos sin cuantizar en el repo) |
| Idiomas soportados | no disponible (hereda los del text encoder de Wan2.1) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato nativo Wan) |

## Arquitectura y entrenamiento

WaveForcing parte del denoisador de difusion de Wan2.1-T2V-1.3B, un modelo diT (Diffusion Transformer) para text-to-video. La contribucion del laboratorio es doble: por un lado, un esquema de destilacion que reduce el muestreo a 4 o 5 pasos de denoising (con listas de pasos tipo 1000,800,600,400,200 en terminologia del pipeline WaveRT); por otro, un mecanismo de forzado causal (de ahi el nombre WaveForcing) que permite generar el video de forma streaming, manteniendo contexto KV causal y usando un modo de intercambio paginado (`--exchange-mode paged`) entre bloques temporales.

El pipeline de inferencia WaveRT requiere cargar el text encoder, el tokenizador y el VAE desde Wan2.1-T2V-1.3B-Diffusers, y soporta particion temporal del VAE (`--vae-partition time`) con 2 o 3 etapas para decodificar por bloques. Los detalles sobre el numero de tokens o la composicion del dataset de entrenamiento no se han publicado en la model card disponible.

## Capacidades

- Generacion de video a partir de texto (text-to-video) en 4 o 5 pasos de denoising.
- Generacion en modo streaming, produciendo el video progresivamente en lugar de por lotes completos.
- Dos variantes de destilacion incluidas: `5step/` y `4step/`, con trade-off entre calidad y velocidad.
- Compatibilidad con backends de atencion intercambiables (por ejemplo, `torch_sdpa`).
- Decodificacion VAE por etapas y particion temporal para reducir la memoria necesaria.
- Contexto KV causal para coherencia entre bloques temporales en streaming.

## Casos de uso

- Generacion de video en tiempo casi real: al reducir el muestreo a 4-5 pasos y trabajar en streaming, es adecuado para previews interactivas donde el usuario ajusta el prompt y ve el resultado sin esperas largas.
- Aplicaciones interactivas y creativas: integracion en editores de video generativo o herramientas de storyboard donde se generan clips sucesivos a partir de descripciones textuales.
- Generacion de video por bloques (streaming): el modo causal con contexto KV permite producir secuencias largas por fragmentos temporales, util para narrativas extendidas.
- Investigacion en difusion destilada: base para experimentar con destilacion de pasos y forzado causal sobre modelos diT existentes, dado que el codigo esta disponible en GitHub.
- Despliegue eficiente en GPU de consumo: al basarse en Wan2.1-1.3B y permitir particion del VAE, reduce los requisitos de VRAM frente a modelos de video de mayor tamano.
- Prototipado de pipelines de video con licencia permisiva: Apache 2.0 permite integrarlo en productos comerciales sin negociar licencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los datos operativos conocidos son los del pipeline: 5 pasos de denoising (lista 1000,800,600,400,200, `wp-size` 6, `vae-stages` 2) o 4 pasos (lista 1000,750,500,250, `wp-size` 5, `vae-stages` 3). No hay metricas de FVD, VBench ni tiempos de generacion publicados en la model card.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al ser un denoisador de 1,3B parametros (aproximadamente 5,7 GB en pesos), una GPU con 8-12 GB de VRAM deberia ser suficiente para inferencia, aunque la generacion de video anade consumo por activaciones y VAE.
- GPU recomendadas: no disponible; por el tamano del modelo, GPUs de consumo tipo RTX 3090/4090 son candidatas razonables.
- Consumer GPU: dado el tamano reducido (1,3B) y las opciones de particion temporal del VAE, es plausible que funcione en GPUs de consumo, aunque no hay confirmacion oficial.
- Despliegue: mediante el codigo oficial WaveRT del repositorio GitHub SJTU-DENG-Lab/WaveForcing, descargando los pesos con `hf download` y el resto de componentes desde Wan2.1-T2V-1.3B-Diffusers. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI (no son modelos de lenguaje).
- Latencia y throughput: no disponibles; el objetivo declarado del enfoque streaming sugiere latencias bajas por bloque, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos de muestreo | Streaming | Licencia |
|---|---|---|---|---|
| WaveForcing-1.3B | 1.3B (denoisador) | 4-5 | Si (causal, KV paginado) | Apache 2.0 |
| Wan2.1-T2V-1.3B (base) | 1.3B | ~50 (difusion estandar) | No | Apache 2.0 |
| Wan2.1-T2V-14B | 14B | ~50 | No | Apache 2.0 |

WaveForcing-1.3B comparte arquitectura base con Wan2.1-T2V-1.3B pero ofrece un muestreo destilado an order de magnitud mas rapido y capacidad de streaming, a costa de posible perdida de calidad respecto al muestreo completo y respecto al modelo de 14B, que ofrece mayor fidelidad visual.

## Limitaciones y advertencias

- No es un modelo autosuficiente: requiere descargar text encoder, tokenizador y VAE de Wan2.1-T2V-1.3B-Diffusers, lo que complica el despliegue.
- Los pesos son solo de inferencia; no se publican pesos de entrenamiento ni detalles del proceso de destilacion.
- No hay benchmarks publicados (FVD, VBench), por lo que la calidad respecto al modelo base debe validarse empiricamente.
- La destilacion agresiva a 4-5 pasos puede degradar la calidad visual o la coherencia temporal frente al muestreo estandar de ~50 pasos.
- El pipeline depende de codigo de investigacion (WaveRT) con opciones de configuracion sensibles (`denoising-step-list`, `wp-size`, `vae-stages`) que deben respetarse tal cual se documentan.
- El repositorio tiene 0 descargas registradas, lo que sugiere adopcion muy temprana y posible falta de madurez o soporte comunitario.
- Licencia Apache 2.0: sin restricciones de uso comercial, pero conviene verificar la licencia de los componentes de Wan2.1 que deben cargarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SJTU-DENG-Lab/WaveForcing-1.3B
- Codigo (GitHub): https://github.com/SJTU-DENG-Lab/WaveForcing
- Componentes requeridos (text encoder, tokenizer, VAE): https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
