# ali-muhammad-younis/AI-Fake-Profile-Detection-Multimodal

## Resumen

AI-Fake-Profile-Detection-Multimodal es un sistema de deteccion de perfiles falsos en redes sociales desarrollado por Muhammad Anas y Ali Muhammad Younis en el Departamento de Inteligencia Artificial de The Islamia University of Bahawalpur (Pakistan), como proyecto de fin de carrera. No se trata de un modelo de lenguaje generativo, sino de un conjunto de clasificadores clasicos de aprendizaje automatico combinados mediante una fusion multimodal por votacion suave (soft-voting) que produce una puntuacion de riesgo de 0 a 100 por ciento por perfil.

El sistema evalua tres modalidades de forma concurrente: 11 indicadores numericos de comportamiento tabular (ratio seguidores-seguidos, densidad de digitos, volumen de publicaciones), la biografia del perfil analizada con TF-IDF mas Naive Bayes para detectar spam y enlaces de phishing, y la foto de perfil inspeccionada con una CNN convolucional de tres bloques para distinguir caras humanas autenticas de avatares por defecto y caras sinteticas generadas por GAN. La fusion agrega las probabilidades de cada rama e incorpora factores de IA explicable (XAI).

Es relevante por su enfoque multimodal aplicado a ciberseguridad y monitorizacion de redes sociales, un caso de uso donde los detectores de una sola modalidad fallan con frecuencia ante bots que combinan biografias plausibles con fotos generadas. Los pesos se distribuyen como artefactos joblib y checkpoints de PyTorch, con licencia MIT y soporte declarado para ingles y urdu.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fusion multimodal: Random Forest / ANN (MLP) / SVM sobre tabular, TF-IDF + Naive Bayes sobre texto, CNN de 3 bloques sobre imagen, agregacion por soft-voting |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; entrada tabular de 11 caracteristicas fijas) |
| Tipos de cuantizacion | no disponible (artefactos joblib y checkpoints PyTorch, no se documenta cuantizacion) |
| Idiomas soportados | en, ur |
| Licencia | MIT |
| Formato de pesos | joblib (modelos tabulares y scaler) y checkpoints PyTorch (CNN y ANN) |

## Arquitectura y entrenamiento

La arquitectura es un ensemble heterogeneo de clasificadores clasicos, no un transformer. La rama tabular procesa 11 caracteristicas numericas (seguidores, seguidos, publicaciones, presencia de biografia, presencia de foto, longitud de biografia, presencia de URL, longitud del nombre de usuario, numero de digitos, ratio de digitos y ratio de seguimiento) y se evalua con Random Forest, SVM y una red MLP de PyTorch. La rama textual aplica TF-IDF sobre la biografia y clasifica con Naive Bayes. La rama visual usa una CNN convolucional de tres bloques para verificar autenticidad de la foto de perfil frente a avatares por defecto y caras sinteticas de GAN. Las probabilidades de las tres ramas se agregan mediante soft-voting para producir el score final de riesgo y factores explicativos.

Los datos de entrenamiento proceden de un conjunto de 10.000 perfiles, segun la model card. No se documenta el numero de tokens ni la composicion detallada del dataset, ni si se aplicaron tecnicas de RLHF o DPO, que no tienen sentido en este tipo de clasificador. La innovacion destacable es la fusion multimodal con XAI: el sistema no solo clasifica, sino que expone que modalidad contribuyo al riesgo detectado.

## Capacidades

- Clasificacion binaria de perfiles como falsos o genuinos con probabilidad asociada.
- Analisis de comportamiento tabular a partir de 11 indicadores numericos.
- Deteccion de spam, phishing y enlaces fraudulentos en biografias mediante TF-IDF y Naive Bayes.
- Verificacion de autenticidad de fotos de perfil: distingue caras humanas, avatares por defecto y caras sinteticas de GAN.
- Fusion multimodal por soft-voting con puntuacion de riesgo de 0 a 100 por ciento.
- IA explicable (XAI): desglose de factores que motivan la clasificacion.
- Soporte de idiomas ingles y urdu en el analisis textual.
- No dispone de tool calling, function calling, razonamiento multi-paso ni modo thinking; no es un modelo generativo.

## Casos de uso

- Monitorizacion de redes sociales en tiempo real: el sistema puede puntuar perfiles de forma automatica a partir de sus estadisticas publicas y priorizar los de mayor riesgo para revision humana, adecuado por su bajo coste computacional frente a modelos generativos.
- Moderacion de comunidades online: integrado en pipelines de plataformas, filtra cuentas con biografias de spam y fotos sinteticas antes de que interactuen con usuarios reales.
- Deteccion de bots en campanhas de desinformacion: la combinacion de ratio seguidores-seguidos anomalo y densidad de digitos en el nombre identifica granjas de cuentas coordinadas.
- Verificacion de identidad en onboarding: la rama CNN comprueba si la foto de perfil es una cara real o un avatar generado, como capa adicional en procesos de registro.
- Investigacion academica en ciberseguridad: sirve como linea base reproducible (pesos joblib publicados) para comparar detectores multimodales frente a unimodales.
- Analisis forense de cuentas tras incidentes: el desglose XAI permite documentar por que una cuenta se marco como fraudulenta, util en informes de moderacion o cumplimiento.
- Filtrado en foros y marketplaces de habla inglesa y urdu: el soporte textual bilingue cubre comunidades de Pakistan y diaspora que otros detectores solo en ingles no atienden.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de 10.000 perfiles; no verificados de forma independiente):

| Arquitectura | Modalidad | Accuracy (%) | Precision (%) | Recall (%) | F1 (%) |
|---|---|---|---|---|---|
| Random Forest (mejor tabular) | Numerica y de comportamiento | 100,00 | 100,00 | 100,00 | 100,00 |
| PyTorch Deep ANN (MLP) | Caracteristicas multicapa | 99,95 | 100,00 | 99,90 | 99,95 |
| Support Vector Machine (SVM) | Separador estadistico | 99,95 | 100,00 | 99,90 | 99,95 |
| TF-IDF + Naive Bayes | Semantica textual (biografia) | 92,55 | 87,03 | 100,00 | 93,07 |
| CNN convolucional | Avatar y cara visual | 100,00 | 100,00 | 100,00 | 100,00 |

El model-index oficial declara accuracy 0,9995 para la tarea de clasificacion tabular de deteccion de perfiles falsos, marcada como no verificada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por el tipo de modelos (Random Forest, SVM, MLP pequena, Naive Bayes y CNN de tres bloques) el requisito es muy bajo, del orden de megabytes a unos pocos cientos de megabytes.
- GPU recomendadas: no disponible; la rama CNN de PyTorch puede ejecutarse en cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) o incluso en CPU.
- Cabe en GPU consumer: si, con amplia holgura; las ramas tabulares y de texto funcionan en CPU sin GPU.
- Opciones de despliegue: carga directa con joblib y PyTorch en Python; no se documenta integracion con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de artefactos.
- Latencia y throughput estimados: no disponibles; por la naturaleza de los clasificadores clasicos, la latencia por perfil seria del orden de milisegundos en CPU.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada modelos comparables de deteccion multimodal de perfiles falsos con pesos publicados. Los detectores de bots comerciales (por ejemplo, soluciones de plataformas de moderacion) no exponen checkpoints ni metricas reproducibles, por lo que la comparacion directa no esta disponible.

| Criterio | AI-Fake-Profile-Detection-Multimodal | Alternativas comerciales de deteccion de bots |
|---|---|---|
| Parametros | no disponible | no disponible |
| Contexto | no aplica (entrada tabular de 11 caracteristicas) | no disponible |
| Rendimiento | accuracy declarada 99,95 por ciento (no verificada) | no disponible |
| Licencia | MIT | propietaria |
| Disponibilidad | pesos publicos en Hugging Face | no disponible |

## Limitaciones y advertencias

- Metricas no verificadas: el accuracy de 99,95 por ciento y los valores cercanos al 100 por ciento en tabular y vision proceden del autor y no han sido replicados de forma independiente; valores tan altos sugieren posible sobreajuste o fuga de datos en el conjunto de 10.000 perfiles.
- Dataset pequeno y no documentado: no se detalla la composicion, el balance de clases ni el proceso de recogida; la generalizacion a otras plataformas o paises es incierta.
- Sesgos potenciales: entrenado sobre perfiles de habla inglesa y urdu, puede penalizar patrones legitimos de comunidades con nombres con digitos o ratios de seguimiento atipicos.
- Riesgo de falsos positivos: la rama de vision marca como sospechosas caras sinteticas, pero usuarios reales que usan avatares artisticos o filtros pueden ser clasificados erroneamente.
- Limitaciones de idioma: el componente textual solo cubre ingles y urdu; biografias en otros idiomas quedan sin analisis semantico fiable.
- No es un modelo generativo: no admite tool calling, agentes ni razonamiento multi-paso; no debe presentarse como sustituto de un LLM.
- Uso comercial: la licencia MIT permite uso comercial, pero el sistema es un proyecto academico sin garantias de produccion ni mantenimiento documentado.
- Advertencia de privacidad: el analisis de fotos de perfil y biografias implica tratamiento de datos personales; su despliegue exige base legal conforme al RGPD y a la normativa local.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ali-muhammad-younis/AI-Fake-Profile-Detection-Multimodal
- Repositorio de la universidad: The Islamia University of Bahawalpur (IUB), Pakistan (no se proporciona URL especifica)
- Paper o publicacion asociada: no disponible
- Demo: no disponible
- Repositorio de codigo adicional: no disponible
