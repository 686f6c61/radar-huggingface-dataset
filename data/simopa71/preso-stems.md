# simopa71/preso-stems

## Resumen

SCNet (base) en formato Core ML es una conversión del modelo de separación de fuentes musicales SCNet, desarrollado originalmente por Weinan Tong et al. y publicado en el paper *SCNet: Sparse Compression Network for Music Source Separation* (2024). El modelo toma una mezcla estéreo a 44,1 kHz y la descompone en cuatro pistas (stems): batería, bajo, otros y voz. Esta versión concreta, publicada por el usuario simopa71, no reentrena ni ajusta los pesos originales: solo convierte el checkpoint de PyTorch a `.mlpackage` para su ejecución en dispositivos Apple mediante Core ML.

La relevancia de esta ficha es acotada: se trata de un artefacto de despliegue para una app iOS concreta (Preso!), no de un modelo de propósito general. El repositorio ocupa 0,1 GB e incluye dos variantes de precisión (fp16 de unos 23 MB y fp32 de unos 45 MB). No hay información sobre parámetros totales, contexto (no aplica, es audio) ni idiomas, ya que la tarea es puramente de procesamiento de señal.

La arquitectura subyacente es SCNet, una red de compresión dispersa orientada a separación de fuentes, no un transformer de lenguaje. El modelo opera sobre representaciones STFT con segmentos fijos de 11 segundos y no incluye el preprocesado ni el postprocesado espectral, que debe implementar el llamador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SCNet (Sparse Compression Network), red convolucional para separacion de fuentes musicales; conversion a Core ML |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; segmentos fijos de 11 s (476 frames) con 25% de solapamiento |
| Tipos de cuantizacion | float16 (aprox. 23 MB) y float32 (aprox. 45 MB) |
| Idiomas soportados | no aplica (modelo de audio) |
| Licencia | MIT (pesos originales confirmados como MIT por los autores) |
| Formato de pesos | Core ML `.mlpackage` (Manifest.json + model.mlmodel + weight.bin) |

## Arquitectura y entrenamiento

SCNet es una red de separacion de fuentes musicales basada en compresion dispersa. En esta conversion, las FFTs a lo largo del eje temporal de la red original se sustituyen por matrices DFT constantes, lo que fija la longitud de segmento en 11 segundos (476 frames). La entrada es un tensor `spec` de forma `(1, 4, 2049, 476)` con disposicion `[canal][real/imag]`, y la salida es `stems` de forma `(1, 16, 2049, 476)` con disposicion `[fuente][canal][real/imag]`, en el orden bateria, bajo, otros y voz. El modelo contiene unicamente la red: la STFT (4096 puntos, hop 1024, ventana rectangular, padding reflect, normalizada), la normalizacion de entrada, el troceado y la STFT inversa los realiza el llamador.

Los pesos provienen del entrenamiento original de los autores sobre MUSDB18-HQ. No hubo reentrenamiento ni fine-tuning en esta conversion; el autor declara que solo se ha cambiado el formato. La fidelidad de conversion medida es de 109 dB en fp32 y 59 dB en fp16 respecto al original en PyTorch.

## Capacidades

- Separacion de fuentes musicales en cuatro stems: bateria, bajo, otros y voz.
- Procesamiento de audio estereo a 44,1 kHz.
- Ejecucion en dispositivo (on-device) en plataformas Apple mediante Core ML.
- Procesamiento por segmentos de 11 s con solapamiento del 25% y cross-fade triangular.
- No incluye generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades de agente.
- No soporta entrada de audio en crudo: requiere que el llamador calcule la STFT y prepare el tensor de entrada.

## Casos de uso

- Separacion de stems en apps iOS de produccion musical: la app Preso! descarga el modelo en el primer uso y ejecuta la separacion completamente en el dispositivo, sin enviar audio a servidores.
- Edicion y remezcla de audio en local: un desarrollador puede extraer la pista de voz o bateria de una mezcla para practicar, samplear o remezclar, manteniendo el audio en el dispositivo por privacidad.
- Karaoke o eliminacion de voz: usando el stem de voz como referencia, se puede atenuar o eliminar para generar versiones instrumentales.
- Practica instrumental: aislar bateria o bajo para tocar sobre la mezcla sin esa pista.
- Herramientas de accesibilidad auditiva: realzar o atenuar stems concretos para mejorar la inteligibilidad en grabaciones musicales.
- Preprocesado en pipelines de analisis musical: obtener stems para transcripcion, deteccion de tempo o analisis armonico en macOS con Core ML, aprovechando el rendimiento medido de unos 2 s por cada 30 s de audio en un M1.

## Benchmarks y rendimiento

Calidad medida por el autor de la conversion sobre 12 extractos de 7 segundos del test de MUSDB18 (SDR global, no comparable uno a uno con las cifras BSSEval del paper):

| Stem | SDR (dB) |
|---|---|
| Bateria | 9,2 |
| Bajo | 7,6 |
| Otros | 5,3 |
| Voz | 10,0 |

Fidelidad de conversion respecto a PyTorch: 109 dB (fp32) y 59 dB (fp16). Velocidad medida en Mac con Apple M1 usando GPU y fp16: aproximadamente 2 s para 30 s de audio. No se han medido velocidad ni memoria en iPhone ni en el Neural Engine. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) porque no aplican a este modelo.

## Requisitos de hardware

- VRAM/RAM estimada: el modelo pesa unos 23 MB en fp16 y unos 45 MB en fp32, por lo que la memoria necesaria es minima; el consumo dominante sera el de los buffers STFT y los tensores de entrada/salida.
- GPU recomendadas: no aplica en el sentido habitual; el modelo esta pensado para GPU y Neural Engine de Apple (M1 y posteriores). No se ha medido el rendimiento en Neural Engine.
- Cabe en cualquier dispositivo Apple moderno; no se ha verificado el comportamiento en iPhone (solo en el simulador, donde fp16 devolvio todo ceros y fp32 funciono).
- Opciones de despliegue: Core ML en macOS/iOS. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: aproximadamente 2 s por cada 30 s de audio en M1 con GPU y fp16; sin datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Tipo | Stems | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SCNet (esta conversion) | SCNet | 4 | MIT | Core ML | Conversion sin reentrenar; segmentos fijos de 11 s |
| Demucs (Meta) | Hibrido transformer/convolucional | 4 | MIT | PyTorch | Referencia habitual en separacion de fuentes; no disponible en esta busqueda para comparacion numerica |
| Open-Unmix | Red lineal/RNN | 4 | MIT | PyTorch | Modelo ligero de referencia; no disponible en esta busqueda para comparacion numerica |

No se dispone de datos comparativos de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo contiene la red: sin la STFT, normalizacion y troceado implementados por el llamador, no produce resultados.
- La longitud de segmento esta fijada en 11 s por la sustitucion de las FFTs por matrices DFT constantes; no admite segmentos arbitrarios.
- En el simulador de iOS, la variante fp16 devolvio todo ceros; solo fp32 funciono. El comportamiento en dispositivo fisico iPhone no se ha medido.
- No se ha verificado el rendimiento en el Neural Engine.
- Los pesos se entrenaron sobre MUSDB18-HQ, un dataset publicado para uso de investigacion y educacion; el autor advierte de que debe comprobarse si esto afecta al uso comercial, aunque la licencia declarada de los pesos es MIT.
- Riesgo de artefactos y confusion entre stems en pasajes densos o instrumentaciones poco comunes; la calidad medida en "otros" es la mas baja (5,3 dB SDR).
- No hay informacion sobre sesgos, alucinacion ni soporte multilingue porque no aplican a esta tarea.
- El repositorio tiene 0 descargas y fue creado en 2026; es un artefacto reciente y de un unico autor, sin validacion externa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/simopa71/preso-stems
- Paper SCNet: Weinan Tong et al., *SCNet: Sparse Compression Network for Music Source Separation* (2024)
- Codigo y pesos originales: https://github.com/starrytong/SCNet
- Confirmacion de licencia MIT de los pesos: https://github.com/starrytong/SCNet/issues/35
